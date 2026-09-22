import requests, time, json

BASE_URL = 'http://127.0.0.1:8000'

def health_check():
    try:
        r = requests.get(f'{BASE_URL}/health')
        print('Health:', r.json())
    except Exception as e:
        print('Health check failed:', e)

def upload_dataset(path):
    with open(path, 'rb') as f:
        files = {'file': (path.split('/')[-1], f, 'text/csv')}
        r = requests.post(f'{BASE_URL}/data/upload', files=files)
        print('Upload response:', r.status_code, r.text)
        return r.json()

def get_datasets():
    r = requests.get(f'{BASE_URL}/data/datasets')
    print('Datasets list:', r.status_code, r.text)
    return r.json()

def query(question, active_dataset):
    payload = {
        'question': question,
        'session_id': 'test-session',
        'active_dataset': active_dataset
    }
    r = requests.post(f'{BASE_URL}/query', json=payload)
    print('Query response:', r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text)
    return r.json()

def delete_dataset(dataset_id):
    r = requests.delete(f'{BASE_URL}/data/datasets/{dataset_id}')
    print('Delete response:', r.status_code, r.text)
    return r.json()

if __name__ == '__main__':
    health_check()
    time.sleep(2)
    upload_res = upload_dataset('scratch/test_employees.csv')
    time.sleep(2)
    ds = get_datasets()
    if not ds.get('datasets'):
        print('No datasets found')
        exit()
    first = ds['datasets'][0]
    table_name = first['table_name']
    dataset_id = first['id']
    # Query average salary in Engineering
    query_res = query('What is the average salary in Engineering?', table_name)
    time.sleep(2)
    # Delete dataset
    delete_res = delete_dataset(dataset_id)
    # Final datasets list
    final_ds = get_datasets()
