# Expense Tracker

A beautifully designed expense tracking application built with Django, MySQL, and a modern UI.

## Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Visualize your expenses with charts and summaries
- **Expense Management**: Add, edit, and delete expenses with categories
- **Budget Tracking**: Set budgets and monitor your spending
- **Reports**: Generate detailed reports and export data to CSV
- **Profile Management**: Update personal information and preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Backend**: Python, Django
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Charts**: Chart.js

## Project Setup

1. Clone the repository
2. Create a virtual environment
3. Install dependencies
4. Configure database settings
5. Run migrations
6. Start the development server

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials and Django secret key
# Then run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

## Usage

After starting the server, navigate to `http://localhost:8000` in your browser.

- Create an account or log in
- Add categories for your expenses
- Start tracking your expenses
- Set up budgets to monitor spending
- View reports to analyze your financial habits

## License

MIT