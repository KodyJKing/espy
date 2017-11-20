def espyget(object, property):
    if type(object).__name__ == 'dict':
        return object[property]
    else:
        return getattr(object, property)

def espyset(object, property, value):
    if type(object).__name__ == 'dict':
        object[property] = value
    else:
        setattr(object, property, value)

a = {}
c = 10
espyset( a, "b", c )