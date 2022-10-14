#!/bin/bash

if [ "$EUID" -eq 0 ]
  then 
    echo "Detected root user. Downgrading to BAMBOO"
    # mkdir -p ${BAMBOO_AGENT_HOME}/bin
    ls -la ${BAMBOO_USER_HOME}
    chown -Rf ${BAMBOO_USER}:${BAMBOO_USER} ${BAMBOO_USER_HOME}
    ls -la ${BAMBOO_AGENT_HOME}
    echo "Logging into docker registry: rgistry.okbtsp.com"
    su - ${BAMBOO_USER} -c "cp \${BAMBOO_AGENT_HOME}/.ssh/* \${BAMBOO_USER_HOME}/.ssh"
    su - ${BAMBOO_USER} -c "docker login -u \$(cat /var/secrets/ciuser) -p \$(cat /var/secrets/cipassword) https://registry.okbtsp.com"
    echo "Start runAgent.sh "
    su - ${BAMBOO_USER} -c "${BAMBOO_USER_HOME}/runAgent.sh $1"
    echo "Start conan config"
    su - ${BAMBOO_USER} -c "conan config install https://repo.okbtsp.com/scm/tspdevopstack/conan-config.git"
    su - ${BAMBOO_USER} -c "conan user $(cat /var/secrets/ciuser) -r ${JFROG_MAIN} -p $(cat /var/secrets/cipassword)"

    if [ -f ~/.ssh/known_hosts ];
    then 
      rm -rf ~/.ssh/known_hosts
    fi
    
    su - ${BAMBOO_USER} -c "mkdir -p ~/.ssh"
    su - ${BAMBOO_USER} -c "ssh-keyscan -t rsa repo.okbtsp.com >> ~/.ssh/known_hosts"
#    su - ${BAMBOO_USER} -c "conan remote add ${JFROG_MAIN} https://jfrog.okbtsp.com/artifactory/api/conan/conan-main"
  else
    echo "Non root startup. User = $USER" 
    cp -a ${BAMBOO_AGENT_HOME}/.ssh/. ${BAMBOO_USER_HOME}/.ssh/
    ls -la ${BAMBOO_AGENT_HOME}
    ls -la ${BAMBOO_USER_HOME}
    ls -la ${BAMBOO_USER_HOME}/.ssh
    docker login -u $(cat /var/secrets/ciuser) -p $(cat /var/secrets/cipassword) https://registry.okbtsp.com
#    conan remote add ${JFROG_MAIN} https://jfrog.okbtsp.com/artifactory/api/conan/conan-main
    conan config install https://repo.okbtsp.com/scm/tspdevopstack/conan-config.git
    conan user $(cat /var/secrets/ciuser) -r ${JFROG_MAIN} -p $(cat /var/secrets/cipassword)
    
    if [ -f ~/.ssh/known_hosts ];
    then 
      rm -rf ~/.ssh/known_hosts
    fi

    mkdir -p ~/.ssh
    ssh-keyscan -t rsa repo.okbtsp.com >> ~/.ssh/known_hosts
    ${BAMBOO_USER_HOME}/runAgent.sh $1
fi