# Marble roll

Static web game served over HTTP (ES modules and asset fetches require a server; opening `index.html` from the file system is not supported).

## Run locally

From this directory (`marble_roll`):

```bash
python -m http.server 8765
```

Then open [http://localhost:8765/](http://localhost:8765/) in your browser.

On some systems the interpreter is `python3` instead of `python`:

```bash
python3 -m http.server 8765
```

To stop the server, press `Ctrl+C` in the terminal.
