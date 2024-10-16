import random


def quicksort(array):
    if len(array) <= 1:
        return array

    pivot = array[0]
    left = 1
    right = len(array) - 1

    while left <= right:
        if array[left] > pivot and array[right] < pivot:
            exchange_and_advance(array, left, right)
            continue
        if array[left] < pivot:
            left += 1
            continue
        if array[right] > pivot:
            right -= 1
            continue

    # Swap pivot element into place
    tmp = array[0]
    array[0] = array[left - 1]
    array[left - 1] = tmp

    left_array = array[:left]
    right_array = array[left:]

    left_array = quicksort(left_array)
    right_array = quicksort(right_array)

    return left_array + right_array


def exchange_and_advance(arr, left, right):
    [arr[left], arr[right]] = [arr[right], arr[left]]
    left += 1
    right -= 1
    return arr, left, right


def confirm_sorted(arr):
    for el, i in enumerate(arr):
        if i < len(arr) - 1:
            if arr[i] > arr[i+1]:
                print(arr, i)
                raise Exception('not sorted')


for i in range(1000):
    source = [x for x in range(1000)]
    random.shuffle(source)
    result = quicksort(source)
    confirm_sorted(result)
    print('\r', i, end='')


