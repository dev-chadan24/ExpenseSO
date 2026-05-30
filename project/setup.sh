#!/bin/bash

# Create virtual environment
python -m venv venv

# Activate virtual environment
. venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create media directory
mkdir -p media

# Create environment file
cp .env.example .env

# Create Django migrations
python manage.py makemigrations users
python manage.py makemigrations expenses

# Apply migrations
python manage.py migrate

# Create superuser (run manually to provide credentials)
echo "Please run 'python manage.py createsuperuser' to create an admin account"

# Run the server
echo "Run 'python manage.py runserver' to start the development server"