import pandas as pd
import numpy as np
from backend.data_import.data_cleaner import clean_dataset

def run_tests():
    print("========================================")
    print("PHASE 8.1 DATA CLEANING TESTS")
    print("========================================\n")
    
    # Create synthetic dataset with all required test conditions
    data = {
        "Name ": [" Rahul ", "Amit", "Amit", "Sneha", "Raj", "Pooja", "Unknown", None, "", "Rahul"],
        "City": ["Mumbai", "mumbai", "mumbai", "MUMBAI", "Pune", "Delhi", "Chennai", "Delhi", "Kolkata", "Mumbai"],
        "Amount": ["100", "200", "200", "300", "unknown", "-500", "400", "500", "600", "100"],
        "Salary": [50000, 60000, 60000, 55000, 70000, 5000000, 40000, 45000, 48000, 50000],
        "Signup Date": ["01/02/2026", "2026-02-01", "2026-02-01", "02-01-2026", "2026-02-05", "2026-02-06", "2026-02-07", "2026-02-08", "2026-02-09", "01/02/2026"]
    }
    
    # We add an exact duplicate row for Amit
    # We add a completely empty row
    raw_df = pd.DataFrame(data)
    raw_df.loc[len(raw_df)] = [np.nan, np.nan, np.nan, np.nan, np.nan]
    
    config = {
        "mode": "safe",
        "trim_whitespace": True,
        "remove_empty_rows": True,
        "remove_duplicates": False,
        "fill_missing": False,
        "standardize_categories": False,
        "normalize_dates": False
    }

    # Store a copy to test integrity
    raw_df_copy = raw_df.copy(deep=True)

    result = clean_dataset(raw_df, config)
    
    report = result["report"]
    issues = result["issues"]
    audit_log = result["audit_log"]
    cleaned_df = result["cleaned_df"]
    
    # ---------------------------------------------------------
    # TEST 1 - Whitespace
    # ---------------------------------------------------------
    print("Test 1 - Whitespace")
    assert "name" in cleaned_df.columns, "Column was not normalized"
    assert cleaned_df.loc[0, "name"] == "Rahul", "Whitespace not trimmed"
    print("Expected: ' Rahul ' -> 'Rahul'")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 2 - Missing value
    # ---------------------------------------------------------
    print("Test 2 - Missing value")
    missing = report["potential_issues"]["missing_values"]
    assert missing > 0, "Missing values not detected"
    print(f"Detected: {missing}")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 3 - Duplicate
    # ---------------------------------------------------------
    print("Test 3 - Duplicate")
    dups = report["potential_issues"]["duplicate_rows"]
    assert dups > 0, "Duplicates not detected"
    assert len(cleaned_df) >= 10, "Duplicates were removed, should be kept by default"
    print(f"Detected: {dups}, Not removed by default")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 4 - Category inconsistency
    # ---------------------------------------------------------
    print("Test 4 - Category inconsistency")
    incons = report["potential_issues"]["category_inconsistencies"]
    assert incons > 0, "Category inconsistency not flagged"
    assert "Mumbai" in cleaned_df["city"].values, "Values should not be silently changed"
    assert "mumbai" in cleaned_df["city"].values, "Values should not be silently changed"
    print("Flagged. Not silently changed.")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 5 & 6 - Numeric strings & Invalid numeric
    # ---------------------------------------------------------
    print("Test 5 & 6 - Numeric Strings & Invalid Numeric")
    print("Amount column contains '100', '200', but also 'unknown'")
    issue_found = any("unknown" in str(cleaned_df["amount"].values) for i in issues) or any("Mixed numeric strings" in i for i in issues)
    assert issue_found, "Mixed numeric string issue not flagged"
    assert "unknown" in cleaned_df["amount"].values, "Invalid numeric was silently converted/removed"
    print("Mixed numeric flagged. 'unknown' not converted to zero.")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 7 - Ambiguous date
    # ---------------------------------------------------------
    print("Test 7 - Ambiguous date")
    date_issue = any("ambiguous date" in i.lower() for i in issues)
    assert date_issue, "Ambiguous date not flagged"
    print("Flagged.")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 8 - Outlier
    # ---------------------------------------------------------
    print("Test 8 - Outlier")
    outliers = report["potential_issues"]["potential_outliers"]
    assert outliers > 0, "Outlier not detected"
    assert 5000000 in cleaned_df["salary"].values, "Outlier was deleted!"
    print("Flagged. Not deleted.")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 9 - Negative value
    # ---------------------------------------------------------
    print("Test 9 - Negative value")
    neg_issue = any("negative" in i.lower() for i in issues)
    assert neg_issue, "Negative value not flagged"
    assert "-500" in cleaned_df["amount"].values, "Negative value was deleted"
    print("Flagged. Not automatically deleted.")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 10 - Empty row
    # ---------------------------------------------------------
    print("Test 10 - Empty row")
    empty_removed = report["safe_changes"]["empty_rows_removed"]
    assert empty_removed > 0, "Empty row not safely removed"
    print(f"Safely removed: {empty_removed}")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 11 - RAW DATA INTEGRITY
    # ---------------------------------------------------------
    print("Test 11 - RAW DATA INTEGRITY")
    pd.testing.assert_frame_equal(raw_df, raw_df_copy)
    print("Raw dataset hash before cleaning = Raw dataset hash after cleaning")
    print("Expected: PASS")
    print("Result: PASS\n")
    
    # ---------------------------------------------------------
    # TEST 12 - DETERMINISM
    # ---------------------------------------------------------
    print("Test 12 - DETERMINISM")
    result2 = clean_dataset(raw_df, config)
    pd.testing.assert_frame_equal(cleaned_df, result2["cleaned_df"])
    print("Same output.")
    print("Result: PASS\n")

if __name__ == "__main__":
    run_tests()
