# actionssdk-tube-status-nodejs
Returns the current status of London Underground lines using [TfL's open data](https://tfl.gov.uk/info-for/open-data-users/) as an Actions on Google App

## Common issues

If this fails with something like:
```
Error: getaddrinfo ENOTFOUND cloud.tfl.gov.uk cloud.tfl.gov.uk:80
    at errnoException (dns.js:28:10)
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:76:26)
```
it's because you're on the Firebase Spark plan, which doesn't support external non-Google services. Enter your billing details and upgrade to the Blaze plan to access use them (which is still free, as long as you don't use more than the [pretty high limits](https://firebase.google.com/pricing/))

## License and contributing

This software is licensed under the [MIT License](https://github.com/domdomegg/actionssdk-tube-status-nodejs/blob/master/LICENSE). Hopefully you can learn and develop from it - please do send pull requests if you think you've improved it in some way (however small, it's really appreciated).
