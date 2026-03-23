from db import engine, Base
import models 

#Creates tables
print("creating tables...")
Base.metadata.create_all(bind=engine)
print("tables created successfully.")

