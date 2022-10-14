FROM atlassian/confluence-server:7.3.5

# USER root

RUN apt-get update \
    && apt-get -y install -y \
          git graphviz \
    && apt-get clean autoclean \
    && apt-get autoremove --yes \
    && rm -rf /var/lib/{apt,dpkg,cache,log}/ \
    && rm -rf /var/lib/apt/lists/*

# USER ${RUN_USER}
