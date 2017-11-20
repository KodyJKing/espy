def espyget(object, property):
    if type(object).__name__ == 'dict':
        if property in object:
            return object[property]
    return getattr(object, property)

def espyset(object, property, value):
    if type(object).__name__ == 'dict':
        object[property] = value
    else:
        setattr(object, property, value)

console = {'log': print}

i = 0
while i < 10:
    if not i < 10:
        break
    espyget( console, "log" )(i)
    i += 1