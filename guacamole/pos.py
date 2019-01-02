
def format(number, total=7, decimal=4):
    return "{{: {0}.{1}f}}".format(total, decimal).format(number)

def formatInt(number, spaces=4):
    return '{{:{0}d}}'.format(spaces).format(number)

import math

s = 1/8

tot = 0
steps = []

while tot <=1:
    steps.append(tot)
    tot += s

size = 10

for step in steps:
    x = size * math.cos(step * 2 * math.pi)
    y = 2
    z = -size * math.sin(step * 2 * math.pi)
    print(f"{{x: {format(x)}, y: {format(y)}, z: {format(z)}}},")