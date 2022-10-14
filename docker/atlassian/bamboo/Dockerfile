FROM atlassian/bamboo-server:7.0.2

USER root

RUN apt-get update \
    && apt-get -y install -y \
          git mercurial \
    && apt-get clean autoclean \
    && apt-get autoremove --yes \
    && rm -rf /var/lib/{apt,dpkg,cache,log}/ \
    && rm -rf /var/lib/apt/lists/*

USER ${BAMBOO_USER}
