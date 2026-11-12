"""Release helper: set the version in data/app-meta.js and sw.js, and add a What's new entry at the top of data/changelog.js.

Usage: python3 -I tools/bump.py <repo> <version> <entry.js>
  entry.js holds ONE JS object literal: { version: 'x.y.z', date: 'YYYY-MM-DD', title, summary, items: [...] }
Then update README by hand (feature list) and run tools/all_checks.sh.
"""
import re, sys, pathlib
repo, ver, entry = pathlib.Path(sys.argv[1]), sys.argv[2], pathlib.Path(sys.argv[3]).read_text().strip().rstrip(',')
assert ("version: '%s'" % ver) in entry, 'entry version does not match'
def sub(path, pat, rep):
    p = repo / path; s = p.read_text(); n = len(re.findall(pat, s)); assert n == 1, (path, pat, n)
    p.write_text(re.sub(pat, rep, s))
sub('data/app-meta.js', r"version: '\d+\.\d+\.\d+'", "version: '%s'" % ver)
sub('sw.js', r"const VERSION = PREFIX \+ '\d+\.\d+\.\d+'", "const VERSION = PREFIX + '%s'" % ver)
p = repo / 'data/changelog.js'; s = p.read_text(); head = 'window.APP_CHANGELOG = [\n'
assert s.count(head) == 1 and ("version: '%s'" % ver) not in s
p.write_text(s.replace(head, head + '  ' + entry + ',\n'))
print('bumped to', ver)
