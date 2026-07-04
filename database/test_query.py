import sqlite3

conn = sqlite3.connect('database/garden.db')
c = conn.cursor()

c.execute("SELECT COUNT(*) FROM relationships WHERE type='companion'")
print("Companion Count:", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM relationships WHERE type='antagonist'")
print("Antagonist Count:", c.fetchone()[0])

c.execute("""
    SELECT p1.name, p2.name, r.type 
    FROM relationships r 
    JOIN plants p1 ON r.plant_id = p1.id 
    JOIN plants p2 ON r.target_id = p2.id 
    LIMIT 10
""")
print("\nSample relationships:")
for row in c.fetchall():
    print(row)

conn.close()
