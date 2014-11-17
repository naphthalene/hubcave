#!/usr/bin/env python

from setuptools import setup, find_packages, Extension

module1 = Extension('demo',
                    sources = ['demo.c'],
                    include_dirs = ['/usr/local/include'])

setup_requires = []

install_requires = [
    'django>=1.6.5,<1.7',
    'south>=0.8.4,<0.9',
    'django-crispy-forms>=1.4.0,<1.5',
    'django-custom-user>=0.4,<0.5',
    'django-tables2>=0.15.0,<0.16',
    'django-braces>=1.4,<1.5',
    'django-sekizai>=0.7,<0.8',
    'django-grappelli>=2.5.1,<2.6',
    'logan>=0.5.10,<0.6',
    'pygithub==1.25.2',
    'python-social-auth<=0.1.26',
    'django-bootstrap-form>=3.1,<3.2',
    'croniter==0.3.4',
    'gevent-socketio>=0.3.6,<0.4',
    'virtualenv>=1.11.6,<1.12',
    'gunicorn==19.1.1',
    'django-extensions==1.4.6',
    'protobuf==2.6.0',
    'protobuf-to-dict==0.1.0'
]

dev_requires = [
    'django_debug_toolbar>=1.2.1,<1.3',
    'django-grappelli>=2.5.3,<2.6',
    'django-debug-toolbar-template-timings>=0.6.4,<0.7',
    'mock>=1.0.1,<1.1',
    'model_mommy>=1.2.1,<1.3'
]

postgres_requires = [
    'psycopg2>=2.5.3,<2.6',
]

mysql_requires = [
    'MySQL-python>=1.2.5,<1.3',
]


setup(
    name='hubcave',
    version='0.2',
    author='Pavel Sadikov',
    url='https://github.com/naphthalene/hubcave',
    description='In-browser, HTML5, GitHub-seeded game.',
    long_description=open('README.md').read(),
    packages=find_packages(),
    zip_safe=False,
    install_requires=install_requires,
    extras_require={
        'dev': install_requires + dev_requires,
        'postgres': install_requires + postgres_requires,
        'mysql': install_requires + mysql_requires,
    },
    license='MIT',
    include_package_data=True,
    entry_points={
        'console_scripts': [
            'hubcave = hubcave.utils.runner:main',
        ],
    },
    classifiers=[
        'Framework :: Django',
        'Programming Language :: Python'
    ],
)
