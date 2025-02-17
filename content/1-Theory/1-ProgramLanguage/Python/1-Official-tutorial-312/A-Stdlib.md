# Brief Tour of the Standard Library

## Operating System Interface

The `os` module provides dozens of functions for interacting with the operating system:

    >>> import os
    >>> os.getcwd()      # Return the current working directory
    'C:\\Python312'
    >>> os.chdir('/server/accesslogs')   # Change current working directory
    >>> os.system('mkdir today')   # Run the command mkdir in the system shell
    0

Be sure to use the `import os` style instead of `from os import *`. This will keep `os.open` from shadowing the built-in `open` function which operates much differently.

pair: built-in function; help

The built-in `dir` and `help` functions are useful as interactive aids for working with large modules like `os`:

    >>> import os
    >>> dir(os)
    <returns a list of all module functions>
    >>> help(os)
    <returns an extensive manual page created from the module's docstrings>

For daily file and directory management tasks, the `shutil` module provides a higher level interface that is easier to use:

    >>> import shutil
    >>> shutil.copyfile('data.db', 'archive.db')
    'archive.db'
    >>> shutil.move('/build/executables', 'installdir')
    'installdir'

## File Wildcards

The `glob` module provides a function for making file lists from directory wildcard searches:

    >>> import glob
    >>> glob.glob('*.py')
    ['primes.py', 'random.py', 'quote.py']

## Command Line Arguments

Common utility scripts often need to process command line arguments. These arguments are stored in the `sys` module's *argv* attribute as a list. For instance, let's take the following `demo.py` file:

    # File demo.py
    import sys
    print(sys.argv)

Here is the output from running `python demo.py one two three` at the command line:

    ['demo.py', 'one', 'two', 'three']

The `argparse` module provides a more sophisticated mechanism to process command line arguments. The following script extracts one or more filenames and an optional number of lines to be displayed:

    import argparse
    
    parser = argparse.ArgumentParser(
        prog='top',
        description='Show top lines from each file')
    parser.add_argument('filenames', nargs='+')
    parser.add_argument('-l', '--lines', type=int, default=10)
    args = parser.parse_args()
    print(args)

When run at the command line with `python top.py --lines=5 alpha.txt beta.txt`, the script sets `args.lines` to `5` and `args.filenames` to `['alpha.txt', 'beta.txt']`.

## Error Output Redirection and Program Termination

The `sys` module also has attributes for *stdin*, *stdout*, and *stderr*. The latter is useful for emitting warnings and error messages to make them visible even when *stdout* has been redirected:

    >>> sys.stderr.write('Warning, log file not found starting a new one\n')
    Warning, log file not found starting a new one

The most direct way to terminate a script is to use `sys.exit()`.

## String Pattern Matching

The `re` module provides regular expression tools for advanced string processing. For complex matching and manipulation, regular expressions offer succinct, optimized solutions:

    >>> import re
    >>> re.findall(r'\bf[a-z]*', 'which foot or hand fell fastest')
    ['foot', 'fell', 'fastest']
    >>> re.sub(r'(\b[a-z]+) \1', r'\1', 'cat in the the hat')
    'cat in the hat'

When only simple capabilities are needed, string methods are preferred because they are easier to read and debug:

    >>> 'tea for too'.replace('too', 'two')
    'tea for two'

## Mathematics

The `math` module gives access to the underlying C library functions for floating point math:

    >>> import math
    >>> math.cos(math.pi / 4)
    0.70710678118654757
    >>> math.log(1024, 2)
    10.0

The `random` module provides tools for making random selections:

    >>> import random
    >>> random.choice(['apple', 'pear', 'banana'])
    'apple'
    >>> random.sample(range(100), 10)   # sampling without replacement
    [30, 83, 16, 4, 8, 81, 41, 50, 18, 33]
    >>> random.random()    # random float
    0.17970987693706186
    >>> random.randrange(6)    # random integer chosen from range(6)
    4

The `statistics` module calculates basic statistical properties (the mean, median, variance, etc.) of numeric data:

    >>> import statistics
    >>> data = [2.75, 1.75, 1.25, 0.25, 0.5, 1.25, 3.5]
    >>> statistics.mean(data)
    1.6071428571428572
    >>> statistics.median(data)
    1.25
    >>> statistics.variance(data)
    1.3720238095238095

The SciPy project \<<https://scipy.org>\> has many other modules for numerical computations.

## Internet Access

There are a number of modules for accessing the internet and processing internet protocols. Two of the simplest are `urllib.request` for retrieving data from URLs and `smtplib` for sending mail:

    >>> from urllib.request import urlopen
    >>> with urlopen('http://worldtimeapi.org/api/timezone/etc/UTC.txt') as response:
    ...     for line in response:
    ...         line = line.decode()             # Convert bytes to a str
    ...         if line.startswith('datetime'):
    ...             print(line.rstrip())         # Remove trailing newline
    ...
    datetime: 2022-01-01T01:36:47.689215+00:00
    
    >>> import smtplib
    >>> server = smtplib.SMTP('localhost')
    >>> server.sendmail('soothsayer@example.org', 'jcaesar@example.org',
    ... """To: jcaesar@example.org
    ... From: soothsayer@example.org
    ...
    ... Beware the Ides of March.
    ... """)
    >>> server.quit()

(Note that the second example needs a mailserver running on localhost.)

## Dates and Times

The `datetime` module supplies classes for manipulating dates and times in both simple and complex ways. While date and time arithmetic is supported, the focus of the implementation is on efficient member extraction for output formatting and manipulation. The module also supports objects that are timezone aware. :

    >>> # dates are easily constructed and formatted
    >>> from datetime import date
    >>> now = date.today()
    >>> now
    datetime.date(2003, 12, 2)
    >>> now.strftime("%m-%d-%y. %d %b %Y is a %A on the %d day of %B.")
    '12-02-03. 02 Dec 2003 is a Tuesday on the 02 day of December.'
    
    >>> # dates support calendar arithmetic
    >>> birthday = date(1964, 7, 31)
    >>> age = now - birthday
    >>> age.days
    14368

## Data Compression

Common data archiving and compression formats are directly supported by modules including: `zlib`, `gzip`, `bz2`, `lzma`, `zipfile` and `tarfile`. :

    >>> import zlib
    >>> s = b'witch which has which witches wrist watch'
    >>> len(s)
    41
    >>> t = zlib.compress(s)
    >>> len(t)
    37
    >>> zlib.decompress(t)
    b'witch which has which witches wrist watch'
    >>> zlib.crc32(s)
    226805979

## Performance Measurement

Some Python users develop a deep interest in knowing the relative performance of different approaches to the same problem. Python provides a measurement tool that answers those questions immediately.

For example, it may be tempting to use the tuple packing and unpacking feature instead of the traditional approach to swapping arguments. The `timeit` module quickly demonstrates a modest performance advantage:

    >>> from timeit import Timer
    >>> Timer('t=a; a=b; b=t', 'a=1; b=2').timeit()
    0.57535828626024577
    >>> Timer('a,b = b,a', 'a=1; b=2').timeit()
    0.54962537085770791

In contrast to `timeit` 's fine level of granularity, the `profile` and `pstats` modules provide tools for identifying time critical sections in larger blocks of code.

## Quality Control

One approach for developing high quality software is to write tests for each function as it is developed and to run those tests frequently during the development process.

The `doctest` module provides a tool for scanning a module and validating tests embedded in a program's docstrings. Test construction is as simple as cutting-and-pasting a typical call along with its results into the docstring. This improves the documentation by providing the user with an example and it allows the doctest module to make sure the code remains true to the documentation:

    def average(values):
        """Computes the arithmetic mean of a list of numbers.
    
        >>> print(average([20, 30, 70]))
        40.0
        """
        return sum(values) / len(values)
    
    import doctest
    doctest.testmod()   # automatically validate the embedded tests

The `unittest` module is not as effortless as the `doctest` module, but it allows a more comprehensive set of tests to be maintained in a separate file:

    import unittest
    
    class TestStatisticalFunctions(unittest.TestCase):
    
        def test_average(self):
            self.assertEqual(average([20, 30, 70]), 40.0)
            self.assertEqual(round(average([1, 5, 7]), 1), 4.3)
            with self.assertRaises(ZeroDivisionError):
                average([])
            with self.assertRaises(TypeError):
                average(20, 30, 70)
    
    unittest.main()  # Calling from the command line invokes all tests

## Batteries Included

Python has a "batteries included" philosophy. This is best seen through the sophisticated and robust capabilities of its larger packages. For example:

- The `xmlrpc.client` and `xmlrpc.server` modules make implementing remote procedure calls into an almost trivial task. Despite the modules' names, no direct knowledge or handling of XML is needed.
- The `email` package is a library for managing email messages, including MIME and other `2822` -based message documents. Unlike `smtplib` and `poplib` which actually send and receive messages, the email package has a complete toolset for building or decoding complex message structures (including attachments) and for implementing internet encoding and header protocols.
- The `json` package provides robust support for parsing this popular data interchange format. The `csv` module supports direct reading and writing of files in Comma-Separated Value format, commonly supported by databases and spreadsheets. XML processing is supported by the `xml.etree.ElementTree`, `xml.dom` and `xml.sax` packages. Together, these modules and packages greatly simplify data interchange between Python applications and other tools.
- The `sqlite3` module is a wrapper for the SQLite database library, providing a persistent database that can be updated and accessed using slightly nonstandard SQL syntax.
- Internationalization is supported by a number of modules including `gettext`, `locale`, and the `codecs` package.

# Brief Tour of the Standard Library --- Part II

This second tour covers more advanced modules that support professional programming needs. These modules rarely occur in small scripts.

## Output Formatting

The `reprlib` module provides a version of `repr` customized for abbreviated displays of large or deeply nested containers:

    >>> import reprlib
    >>> reprlib.repr(set('supercalifragilisticexpialidocious'))
    "{'a', 'c', 'd', 'e', 'f', 'g', ...}"

The `pprint` module offers more sophisticated control over printing both built-in and user defined objects in a way that is readable by the interpreter. When the result is longer than one line, the "pretty printer" adds line breaks and indentation to more clearly reveal data structure:

    >>> import pprint
    >>> t = [[[['black', 'cyan'], 'white', ['green', 'red']], [['magenta',
    ...     'yellow'], 'blue']]]
    ...
    >>> pprint.pprint(t, width=30)
    [[[['black', 'cyan'],
       'white',
       ['green', 'red']],
      [['magenta', 'yellow'],
       'blue']]]

The `textwrap` module formats paragraphs of text to fit a given screen width:

    >>> import textwrap
    >>> doc = """The wrap() method is just like fill() except that it returns
    ... a list of strings instead of one big string with newlines to separate
    ... the wrapped lines."""
    ...
    >>> print(textwrap.fill(doc, width=40))
    The wrap() method is just like fill()
    except that it returns a list of strings
    instead of one big string with newlines
    to separate the wrapped lines.

The `locale` module accesses a database of culture specific data formats. The grouping attribute of locale's format function provides a direct way of formatting numbers with group separators:

    >>> import locale
    >>> locale.setlocale(locale.LC_ALL, 'English_United States.1252')
    'English_United States.1252'
    >>> conv = locale.localeconv()          # get a mapping of conventions
    >>> x = 1234567.8
    >>> locale.format_string("%d", x, grouping=True)
    '1,234,567'
    >>> locale.format_string("%s%.*f", (conv['currency_symbol'],
    ...                      conv['frac_digits'], x), grouping=True)
    '$1,234,567.80'

## Templating

The `string` module includes a versatile `~string.Template` class with a simplified syntax suitable for editing by end-users. This allows users to customize their applications without having to alter the application.

The format uses placeholder names formed by `$` with valid Python identifiers (alphanumeric characters and underscores). Surrounding the placeholder with braces allows it to be followed by more alphanumeric letters with no intervening spaces. Writing `$$` creates a single escaped `$`:

    >>> from string import Template
    >>> t = Template('${village}folk send $$10 to $cause.')
    >>> t.substitute(village='Nottingham', cause='the ditch fund')
    'Nottinghamfolk send $10 to the ditch fund.'

The `~string.Template.substitute` method raises a `KeyError` when a placeholder is not supplied in a dictionary or a keyword argument. For mail-merge style applications, user supplied data may be incomplete and the `~string.Template.safe_substitute` method may be more appropriate ---it will leave placeholders unchanged if data is missing:

    >>> t = Template('Return the $item to $owner.')
    >>> d = dict(item='unladen swallow')
    >>> t.substitute(d)
    Traceback (most recent call last):
      ...
    KeyError: 'owner'
    >>> t.safe_substitute(d)
    'Return the unladen swallow to $owner.'

Template subclasses can specify a custom delimiter. For example, a batch renaming utility for a photo browser may elect to use percent signs for placeholders such as the current date, image sequence number, or file format:

    >>> import time, os.path
    >>> photofiles = ['img_1074.jpg', 'img_1076.jpg', 'img_1077.jpg']
    >>> class BatchRename(Template):
    ...     delimiter = '%'
    ...
    >>> fmt = input('Enter rename style (%d-date %n-seqnum %f-format):  ')
    Enter rename style (%d-date %n-seqnum %f-format):  Ashley_%n%f
    
    >>> t = BatchRename(fmt)
    >>> date = time.strftime('%d%b%y')
    >>> for i, filename in enumerate(photofiles):
    ...     base, ext = os.path.splitext(filename)
    ...     newname = t.substitute(d=date, n=i, f=ext)
    ...     print('{0} --> {1}'.format(filename, newname))
    
    img_1074.jpg --> Ashley_0.jpg
    img_1076.jpg --> Ashley_1.jpg
    img_1077.jpg --> Ashley_2.jpg

Another application for templating is separating program logic from the details of multiple output formats. This makes it possible to substitute custom templates for XML files, plain text reports, and HTML web reports.

## Working with Binary Data Record Layouts

The `struct` module provides `~struct.pack` and `~struct.unpack` functions for working with variable length binary record formats. The following example shows how to loop through header information in a ZIP file without using the `zipfile` module. Pack codes `"H"` and `"I"` represent two and four byte unsigned numbers respectively. The `"<"` indicates that they are standard size and in little-endian byte order:

    import struct
    
    with open('myfile.zip', 'rb') as f:
        data = f.read()
    
    start = 0
    for i in range(3):                      # show the first 3 file headers
        start += 14
        fields = struct.unpack('<IIIHH', data[start:start+16])
        crc32, comp_size, uncomp_size, filenamesize, extra_size = fields
    
        start += 16
        filename = data[start:start+filenamesize]
        start += filenamesize
        extra = data[start:start+extra_size]
        print(filename, hex(crc32), comp_size, uncomp_size)
    
        start += extra_size + comp_size     # skip to the next header

## Multi-threading

Threading is a technique for decoupling tasks which are not sequentially dependent. Threads can be used to improve the responsiveness of applications that accept user input while other tasks run in the background. A related use case is running I/O in parallel with computations in another thread.

The following code shows how the high level `threading` module can run tasks in background while the main program continues to run:

    import threading, zipfile
    
    class AsyncZip(threading.Thread):
        def __init__(self, infile, outfile):
            threading.Thread.__init__(self)
            self.infile = infile
            self.outfile = outfile
    
        def run(self):
            f = zipfile.ZipFile(self.outfile, 'w', zipfile.ZIP_DEFLATED)
            f.write(self.infile)
            f.close()
            print('Finished background zip of:', self.infile)
    
    background = AsyncZip('mydata.txt', 'myarchive.zip')
    background.start()
    print('The main program continues to run in foreground.')
    
    background.join()    # Wait for the background task to finish
    print('Main program waited until background was done.')

The principal challenge of multi-threaded applications is coordinating threads that share data or other resources. To that end, the threading module provides a number of synchronization primitives including locks, events, condition variables, and semaphores.

While those tools are powerful, minor design errors can result in problems that are difficult to reproduce. So, the preferred approach to task coordination is to concentrate all access to a resource in a single thread and then use the `queue` module to feed that thread with requests from other threads. Applications using `~queue.Queue` objects for inter-thread communication and coordination are easier to design, more readable, and more reliable.

## Logging

The `logging` module offers a full featured and flexible logging system. At its simplest, log messages are sent to a file or to `sys.stderr`:

    import logging
    logging.debug('Debugging information')
    logging.info('Informational message')
    logging.warning('Warning:config file %s not found', 'server.conf')
    logging.error('Error occurred')
    logging.critical('Critical error -- shutting down')

This produces the following output:

``` none
WARNING:root:Warning:config file server.conf not found
ERROR:root: Error occurred
CRITICAL:root: Critical error -- shutting down
```

By default, informational and debugging messages are suppressed and the output is sent to standard error. Other output options include routing messages through email, datagrams, sockets, or to an HTTP Server. New filters can select different routing based on message priority: `~logging. DEBUG`, `~logging. INFO`, `~logging. WARNING`, `~logging. ERROR`, and `~logging. CRITICAL`.

The logging system can be configured directly from Python or can be loaded from a user editable configuration file for customized logging without altering the application.

## Weak References

Python does automatic memory management (reference counting for most objects and `garbage collection` to eliminate cycles). The memory is freed shortly after the last reference to it has been eliminated.

This approach works fine for most applications but occasionally there is a need to track objects only as long as they are being used by something else. Unfortunately, just tracking them creates a reference that makes them permanent. The `weakref` module provides tools for tracking objects without creating a reference. When the object is no longer needed, it is automatically removed from a weakref table and a callback is triggered for weakref objects. Typical applications include caching objects that are expensive to create:

    >>> import weakref, gc
    >>> class A:
    ...     def __init__(self, value):
    ...         self. value = value
    ...     def __repr__(self):
    ...         return str (self. value)
    ...
    >>> a = A (10)                   # create a reference
    >>> d = weakref.WeakValueDictionary ()
    >>> d['primary'] = a            # does not create a reference
    >>> d['primary']                # fetch the object if it is still alive
    10
    >>> del a                       # remove the one reference
    >>> gc.collect ()                # run garbage collection right away
    0
    >>> d['primary']                # entry was automatically removed
    Traceback (most recent call last):
      File "<stdin>", line 1, in <module>
        d['primary']                # entry was automatically removed
      File "C:/python 312/lib/weakref. py", line 46, in __getitem__
        o = self. data [key]()
    KeyError: 'primary'

## Tools for Working with Lists

Many data structure needs can be met with the built-in list type. However, sometimes there is a need for alternative implementations with different performance trade-offs.

The `array` module provides an `~array.array ()` object that is like a list that stores only homogeneous data and stores it more compactly. The following example shows an array of numbers stored as two byte unsigned binary numbers (typecode `"H"`) rather than the usual 16 bytes per entry for regular lists of Python int objects:

    >>> from array import array
    >>> a = array ('H', [4000, 10, 700, 22222])
    >>> sum (a)
    26932
    >>> a[1:3]
    array ('H', [10, 700])

The `collections` module provides a `~collections.deque ()` object that is like a list with faster appends and pops from the left side but slower lookups in the middle. These objects are well suited for implementing queues and breadth first tree searches:

    >>> from collections import deque
    >>> d = deque (["task 1", "task 2", "task 3"])
    >>> d.append ("task 4")
    >>> print ("Handling", d.popleft ())
    Handling task 1
    
    unsearched = deque ([starting_node])
    def breadth_first_search (unsearched):
        node = unsearched.popleft ()
        for m in gen_moves (node):
            if is_goal (m):
                return m
            unsearched.append (m)

In addition to alternative list implementations, the library also offers other tools such as the `bisect` module with functions for manipulating sorted lists:

    >>> import bisect
    >>> scores = [(100, 'perl'), (200, 'tcl'), (400, 'lua'), (500, 'python')]
    >>> bisect.insort (scores, (300, 'ruby'))
    >>> scores
    [(100, 'perl'), (200, 'tcl'), (300, 'ruby'), (400, 'lua'), (500, 'python')]

The `heapq` module provides functions for implementing heaps based on regular lists. The lowest valued entry is always kept at position zero. This is useful for applications which repeatedly access the smallest element but do not want to run a full list sort:

    >>> from heapq import heapify, heappop, heappush
    >>> data = [1, 3, 5, 7, 9, 2, 4, 6, 8, 0]
    >>> heapify (data)                      # rearrange the list into heap order
    >>> heappush (data, -5)                 # add a new entry
    >>> [heappop (data) for i in range (3)]  # fetch the three smallest entries
    [-5, 0, 1]

## Decimal Floating Point Arithmetic

The `decimal` module offers a `~decimal. Decimal` datatype for decimal floating point arithmetic. Compared to the built-in `float` implementation of binary floating point, the class is especially helpful for

- financial applications and other uses which require exact decimal representation,
- control over precision,
- control over rounding to meet legal or regulatory requirements,
- tracking of significant decimal places, or
- applications where the user expects the results to match calculations done by hand.

For example, calculating a 5% tax on a 70 cent phone charge gives different results in decimal floating point and binary floating point. The difference becomes significant if the results are rounded to the nearest cent:

    >>> from decimal import *
    >>> round (Decimal ('0.70') * Decimal ('1.05'), 2)
    Decimal ('0.74')
    >>> round (. 70 * 1.05, 2)
    0.73

The `~decimal. Decimal` result keeps a trailing zero, automatically inferring four place significance from multiplicands with two place significance. Decimal reproduces mathematics as done by hand and avoids issues that can arise when binary floating point cannot exactly represent decimal quantities.

Exact representation enables the `~decimal. Decimal` class to perform modulo calculations and equality tests that are unsuitable for binary floating point:

    >>> Decimal ('1.00') % Decimal ('. 10')
    Decimal ('0.00')
    >>> 1.00 % 0.10
    0.09999999999999995
    
    >>> sum ([Decimal ('0.1')]*10) == Decimal ('1.0')
    True
    >>> 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 == 1.0
    False

The `decimal` module provides arithmetic with as much precision as needed:

    >>> getcontext (). prec = 36
    >>> Decimal (1) / Decimal (7)
    Decimal ('0.142857142857142857142857142857142857')
