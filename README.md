# tayaladitya.github.io

Forwards `tayaladitya.github.io/ip:PORT` to the Raspberry Pi on that port,
wherever DHCP has put it today.

- `/ip:4011` goes to `http://<pi>:4011/` (nginx there upgrades to https).
- `/ip:8080/login?x=1` keeps the path, query and fragment.
- The port is required: `/ip` alone, and any other path, opens nothing.
- `?stay` shows the address without redirecting.

The Pi's address is not stored here. `404.html` reads it at request time from
the two pages the Pi already publishes on the same origin,
[`tp-live/address.json`](https://tayaladitya.github.io/tp-live/address.json) and
[`flp-live`](https://tayaladitya.github.io/flp-live/), and uses whichever
reported a change most recently. Nothing on the Pi pushes to this repository.

The Pi is on the institute network, so the link only works from campus WiFi.
