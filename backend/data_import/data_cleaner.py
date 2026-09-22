import pandas as pd
import numpy as np
from backend.data_import.table_name_generator import clean_identifier

def clean_dataset(raw_df: pd.DataFrame, config: dict) -> dict:
    """
    Safely and conservatively cleans a pandas DataFrame based on the configuration.
    Never modifies the original raw_df.
    """
    df = raw_df.copy(deep=True)
    audit_log = []
    issues = []
    
    # default config
    mode = config.get("mode", "safe") # safe, profile_only
    trim_whitespace = config.get("trim_whitespace", True)
    remove_empty_rows = config.get("remove_empty_rows", True)
    remove_duplicates = config.get("remove_duplicates", False)
    fill_missing = config.get("fill_missing", False)
    standardize_categories = config.get("standardize_categories", False)
    normalize_dates = config.get("normalize_dates", False)

    report = {
        "original_rows": len(raw_df),
        "original_columns": len(raw_df.columns),
        "safe_changes": {
            "whitespace_trimmed": 0,
            "empty_rows_removed": 0,
            "numeric_conversions": 0,
            "column_names_normalized": 0
        },
        "potential_issues": {
            "missing_values": 0,
            "duplicate_rows": 0,
            "potential_outliers": 0,
            "category_inconsistencies": 0,
            "invalid_dates": 0,
            "negative_values": 0,
            "empty_columns": 0
        },
        "not_applied": {
            "remove_duplicates": not remove_duplicates,
            "fill_missing": not fill_missing,
            "standardize_categories": not standardize_categories,
            "normalize_dates": not normalize_dates
        }
    }
    
    # 1. Duplicates
    dup_count = raw_df.duplicated().sum()
    if dup_count > 0:
        report["potential_issues"]["duplicate_rows"] = int(dup_count)
        issues.append(f"Duplicate rows detected: {dup_count}. Not removed by default.")
        if remove_duplicates and mode == "safe":
             df = df.drop_duplicates()
             audit_log.append({"operation": "remove_exact_duplicate_rows", "rows_removed": int(dup_count)})
             
    # 2. Empty rows
    empty_rows_mask = raw_df.isnull().all(axis=1)
    empty_rows_count = empty_rows_mask.sum()
    if empty_rows_count > 0:
        if remove_empty_rows and mode == "safe":
            df = df.dropna(how='all')
            report["safe_changes"]["empty_rows_removed"] = int(empty_rows_count)
            audit_log.append({"operation": "remove_empty_rows", "rows_removed": int(empty_rows_count)})
        else:
            issues.append(f"Completely empty rows detected: {empty_rows_count}")
            
    # 3. Empty columns
    empty_cols = [col for col in df.columns if df[col].isnull().all()]
    if empty_cols:
        report["potential_issues"]["empty_columns"] = len(empty_cols)
        issues.append(f"Completely empty columns detected: {empty_cols}")
        
    # 4. Column Normalization
    if mode == "safe":
        new_cols = []
        changed_cols = 0
        seen_cols = {}
        for col in df.columns:
            new_c = clean_identifier(str(col))
            # dedup
            if new_c in seen_cols:
                seen_cols[new_c] += 1
                new_c = f"{new_c}_{seen_cols[new_c]}"
            else:
                seen_cols[new_c] = 1
                
            new_cols.append(new_c)
            if new_c != str(col):
                changed_cols += 1
                
        df.columns = new_cols
        if changed_cols > 0:
             report["safe_changes"]["column_names_normalized"] = changed_cols
             audit_log.append({"operation": "normalize_columns", "columns_changed": changed_cols})

    # 5. Cell-level operations
    trimmed_cells = 0
    numeric_conversions = 0
    missing_cells = 0
    
    for col in df.columns:
        # Detect missing
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            missing_cells += missing_count
            issues.append(f"Missing values in column '{col}': {missing_count}")
            
        # If object/string type
        if pd.api.types.is_object_dtype(df[col]):
            # Trim whitespace
            if trim_whitespace and mode == "safe":
                # Convert only str
                mask_str = df[col].apply(lambda x: isinstance(x, str))
                if mask_str.any():
                    # Count before/after differences to log
                    before_trim = df.loc[mask_str, col]
                    after_trim = before_trim.str.strip()
                    changed_mask = (before_trim != after_trim)
                    changed_count = changed_mask.sum()
                    if changed_count > 0:
                        trimmed_cells += changed_count
                        df.loc[mask_str, col] = after_trim
                        audit_log.append({"operation": "trim_whitespace", "column": col, "affected_cells": int(changed_count)})
                        
            # Detect empty strings or whitespace only as missing
            ws_only = df[col].apply(lambda x: isinstance(x, str) and (x.strip() == ""))
            if ws_only.any():
                 issues.append(f"Whitespace-only strings detected in '{col}': {ws_only.sum()}")
                 if trim_whitespace and mode == "safe":
                     df.loc[ws_only, col] = np.nan # safely map to missing
                     audit_log.append({"operation": "convert_whitespace_to_nan", "column": col, "affected_cells": int(ws_only.sum())})

            # Detect categorical inconsistency (case mismatch)
            str_vals = df[col].dropna().apply(lambda x: str(x) if isinstance(x, str) else None).dropna()
            if not str_vals.empty:
                unique_lower = str_vals.str.lower().unique()
                unique_original = str_vals.unique()
                if len(unique_original) > len(unique_lower) and len(unique_original) < 20: # heuristic for categories
                    issues.append(f"Potential inconsistent values detected in column: {col}")
                    report["potential_issues"]["category_inconsistencies"] += 1
            
            # Numeric strings detection
            if str_vals.shape[0] > 0:
                converted = pd.to_numeric(str_vals, errors='coerce')
                conv_success = converted.notna()
                
                # Check negative values in converted
                if conv_success.any():
                    neg_mask = converted[conv_success] < 0
                    if neg_mask.any():
                        report["potential_issues"]["negative_values"] += 1
                        issues.append(f"Negative values detected in column '{col}': {neg_mask.sum()}")
                
                if conv_success.sum() > 0 and conv_success.sum() == len(str_vals):
                     # All are numeric!
                     if mode == "safe":
                         df[col] = pd.to_numeric(df[col], errors='coerce')
                         numeric_conversions += 1
                         audit_log.append({"operation": "convert_to_numeric", "column": col})
                elif conv_success.sum() > 0:
                     issues.append(f"Mixed numeric strings in column '{col}': Convertible: {conv_success.sum()}, Non-convertible: {(~conv_success).sum()}")

            # Date detection (very naive check for ambiguity)
            if str_vals.shape[0] > 0:
                # heuristic: if many values contain "-" or "/"
                if str_vals.str.contains(r'\d{2,4}[-/]\d{1,2}[-/]\d{1,4}').sum() > 0:
                    issues.append(f"Potential ambiguous date format in column: {col}. FLAG FOR REVIEW.")
                    report["potential_issues"]["invalid_dates"] += 1

        elif pd.api.types.is_numeric_dtype(df[col]):
            # Detect negative values
            neg_mask = df[col] < 0
            if neg_mask.any():
                report["potential_issues"]["negative_values"] += 1
                issues.append(f"Negative values detected in column '{col}': {neg_mask.sum()}")
                
            # Outlier detection (IQR)
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            if iqr > 0:
                outlier_mask = (df[col] < (q1 - 1.5 * iqr)) | (df[col] > (q3 + 1.5 * iqr))
                if outlier_mask.any():
                     report["potential_issues"]["potential_outliers"] += int(outlier_mask.sum())
                     issues.append(f"Potential outliers in column '{col}': {outlier_mask.sum()}")

    report["potential_issues"]["missing_values"] = int(missing_cells)
    report["safe_changes"]["whitespace_trimmed"] = int(trimmed_cells)
    report["safe_changes"]["numeric_conversions"] = int(numeric_conversions)

    # After safe cleaning stats
    report["after_rows"] = len(df)
    report["after_columns"] = len(df.columns)
    
    return {
        "report": report,
        "issues": issues,
        "audit_log": audit_log,
        "cleaned_df": df,
        "raw_df": raw_df
    }
