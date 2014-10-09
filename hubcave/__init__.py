try:
    VERSION = __import__('pkg_resources').get_distribution('hubcave').version
except Exception as e:
    VERSION = 'unknown'
