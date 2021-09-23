from app import app
from datetime import datetime
import os
from werkzeug.utils import secure_filename

from flask import render_template
from flask import request, redirect
from flask import jsonify, make_response
from flask import send_file, send_from_directory, safe_join, abort
from flask import session, url_for
from flask import flash


@app.route("/")
def index():
    #world map, hopening
    return render_template("public/index.html")

@app.route("/overhead")
def overhead():
    #overhead
    return render_template("public/overhead.html")

@app.route("/news")
def news():
    return render_template("public/news.html")


@app.before_first_request
def before_first_request_func():
    """ 
    This function will run once before the first request to this instance of the application.
    You may want to use this function to create any databases/tables required for your app.
    """
    print("This function will run once ")


@app.before_request
def before_request_func():
    """ 
    This function will run before every request. Let's add something to the session & g.
    It's a good place for things like establishing database connections, retrieving
    user information from the session, assigning values to the flask g object etc..
    We have access to the request context.
    """
    session["foo"] = "bar"
    print("before_request is running!")

@app.after_request
def after_request_func(response):
    """ 
    This function will run after a request, as long as no exceptions occur.
    It must take and return the same parameter - an instance of response_class.
    This is a good place to do some application cleanup.
    """
    # username = g.username
    # foo = session.get("foo")
    print("after_request is running!")
    return response


@app.teardown_request
def teardown_request_func(error=None):
    """ 
    This function will run after a request, regardless if an exception occurs or not.
    It's a good place to do some cleanup, such as closing any database connections.
    If an exception is raised, it will be passed to the function.
    You should so everything in your power to ensure this function does not fail, so
    liberal use of try/except blocks is recommended.
    """
    print("teardown_request is running!")
    if error:
        # Log the error
        print(str(error))
