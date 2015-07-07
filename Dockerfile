FROM cogniteev/echo

COPY public /srv/payments-example
COPY .git/FETCH_HEAD /srv/payments-example/git-rev.txt
VOLUME /srv/payments-example
