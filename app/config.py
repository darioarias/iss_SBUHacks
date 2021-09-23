import os
import secrets

class Config(object):
  DEBUG = False
  TESTING = False
  SECRET_KEY = ""

  DB_NAME = "production-db"
  DB_USERNAME = "admin"
  DB_PASSWORD = "example"

  IMAGE_UPLOADS = f"{os.getcwd()}/app/static/img/uploads"#"/Users/darioarias/Desktop/github/nyc_floods/app/app/static/img/uploads"

  ALLOWED_IMAGE_EXTENSIONS = ["JPEG", "JPG", "PNG", "GIF"]
  MAX_CONTENT_LENGTH = 50 * 1024 * 1024
  CLIENT_IMAGES= f"{os.getcwd()}/app/static/client/img"
  CLIENT_CSV= f"{os.getcwd()}/app/static/client/csv"
  CLIENT_PDF= f"{os.getcwd()}/app/static/client/pdf"
  SECRET_KEY= secrets.token_urlsafe(255)
  SESSION_COOKIE_SECURE = True

class ProductionConfig(Config):
  pass

class DevelopmentConfig(Config):
  DEBUG = True

  DB_NAME = "development-db"
  DB_USERNAME = "admin"
  DB_PASSWORD = "example"

  IMAGE_UPLOADS = f"{os.getcwd()}/app/static/img/uploads"

  SESSION_COOKIE_SECURE = False

class TestingConfig(Config):
  TESTING = True

  DB_NAME = "development-db"
  DB_USERNAME = "admin"
  DB_PASSWORD = "example"
  SESSION_COOKIE_SECURE = False