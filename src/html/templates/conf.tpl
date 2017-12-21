<VirtualHost *:80>
    # Server config
    ServerName domain.com
    DocumentRoot /var/www/html

    # Allow access to URI space
    <Directory /var/www/html>
    Allow from all
    Options -MultiViews
    # For Apache >= 2.4
    # Require all granted
    </Directory>

    # Allow access to Rails app's public files
    # that are outside of URI space
    Alias /subdirectory /path/to/app/public

    # Run Rails app from /subdirectory
    <Location /subdirectory>
    PassengerBaseURI /subdirectory
    PassengerAppRoot /path/to/app
    </Location>

    # Additional rules for files in the public directory of Rails app
    <Directory /path/to/app/public>
    Allow from all
    Options -MultiViews
    # For Apache >= 2.4
    # Require all granted
    PassengerFriendlyErrorPages on
    </Directory>
</VirtualHost>