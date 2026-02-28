import requests

token = "8548880154:AAG4MTXi7Mc7jDHdse9_DiBGVAdUI44wETM"
url = f"https://api.telegram.org/bot{token}/getUpdates"
print(f"Fetching from {url}...")
try:
    response = requests.get(url)
    data = response.json()
    print("Updates:")
    for result in data.get('result', []):
        if 'message' in result:
            msg = result['message']
            user = msg.get('from', {})
            text = msg.get('text', '')
            print(f"User ID: {user.get('id')}, Username: {user.get('username')}, Text: {text}")
except Exception as e:
    print(f"Error: {e}")
