from sqlalchemy.exc import OperationalError
from sqlalchemy import create_engine
try:
    engine = create_engine("mysql+pymysql://root:my_secret_password@localhost:3306/wrong_db")
    engine.connect()
except OperationalError as e:
    print("ERROR STRING:", str(e))
