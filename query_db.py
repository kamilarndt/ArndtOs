import sqlite3
import os

db_path = r'd:\_WorkSpaces\ArndtOs\workspace\memory\brain.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")
        
        for table in tables:
            print(f"\nLast 3 rows from {table[0]}:")
            try:
                cursor.execute(f"SELECT * FROM {table[0]} ORDER BY rowid DESC LIMIT 3")
                rows = cursor.fetchall()
                for row in rows:
                    print(row)
            except Exception as e:
                print(f"Error querying {table[0]}: {e}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
