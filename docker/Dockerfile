FROM 	node:8-alpine

RUN 	apk update && apk add openssh-client make git
RUN 	npm install --global yarn

ADD 	.npmrc /root/.npmrc
ADD 	ssh /root/.ssh

ADD 	testdata.tgz /test

RUN 	ssh-keyscan -t rsa 172.17.0.1 >> /root/.ssh/known_hosts && chown -R root.root /root/.ssh && chmod 600 /root/.ssh/*
WORKDIR /test
# RUN	tar -xzf testdata.tgz 
# RUN	rm testdata.tgz

VOLUME ["usr/local/share/.cache/yarn"]
