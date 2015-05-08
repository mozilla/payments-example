FROM busybox

COPY public /srv/payments-example
VOLUME /srv/payments-example
CMD ["true"]
