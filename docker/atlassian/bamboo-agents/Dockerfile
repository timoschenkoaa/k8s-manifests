FROM atlassian/bamboo-agent-base:7.0.2

# setup ROOT user to install all APT'S, TSP TOOLS and QT
USER root

# installing BASE APT'S required for remote agent
RUN apt-get update \
    && apt-get -y install -y \
          build-essential \
          cmake bash \
          libxcb1-dev \
          docker.io \
          maven \
          git \
          mercurial \
          wget \
          doxygen \
          libssl-dev \
          linux-headers-generic \
          curl \
          libxrender-dev \
          libpng-dev \
          libjpeg-turbo8 \
          libjpeg-turbo8-dev \
          libicu-dev \
          mesa-common-dev \
          libglu1-mesa-dev \
          libgles2-mesa \
          libgles2-mesa-dev \
          libfreetype6-dev \
          libsqlite3-dev \
          libssh-dev \
          libgtest-dev \
          libxcb-xinerama0-dev \
          libxkbcommon-x11-0 \
          libqt5sql5-psql  \
          libstdc++-5-dev \
          libjbig-dev \
          libtiff-dev \
          libeigen3-dev \
          python3-pip \
          ansible \
          libx11-dev  \
          libogg-dev \
          libvorbis-dev \
          bzip2 \
          gperf \
          bison \
          ruby \
          flex \
          libfontconfig1 \
          libdbus-1-3 \
          libx11-dev \
          libx11-doc \
          libxau-dev \
          libxdmcp-dev \
          x11proto-core-dev \
          x11proto-input-dev \
          x11proto-kb-dev xorg-sgml-doctools xtrans-dev \
          libglew-dev libpthread-stubs0-dev ffmpeg libsm6 libxext6 libgl-dev libgl1-mesa-glx libgl1-mesa-dev libgl1 libssh2-1 libqt5qml5 libqt5xml5 \
          gcc g++ qtchooser freeglut3-dev libxmu-dev libxi-dev mesa-utils  \
          binutils make p7zip-full pv genisoimage fakeroot qt5-default libqt5serialport5-dev libqt5xmlpatterns5-dev libboost-all-dev libqwt-qt5-dev qtgstreamer-plugins-qt5 gstreamer1.0-plugins-bad libgstreamer1.0-dev libqt5gstreamer-dev libavcodec-dev libavformat-dev libswscale-dev \
          libavutil-dev qttools5-dev-tools libasound2-dev libssh2-1-dev libxfixes-dev qtdeclarative5-dev qtmultimedia5-dev libqt5multimediawidgets5 libqt5multimedia5-plugins libqt5opengl5-dev language-pack-ru libfftw3-dev libresample1-dev libpq-dev libpoppler-qt5-dev \
    && pip3 install conan --upgrade \
    && pip3 install awxkit \
    && apt-get clean autoclean \
    && apt-get autoremove --yes \
    && rm -rf /var/lib/{apt,dpkg,cache,log}/ \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://jfrog.okbtsp.com/artifactory/ubuntu-local/pool/focal/gisdesigner12_12.5.0-1_amd64.deb && dpkg -i gisdesigner12_12.5.0-1_amd64.deb \
     && wget https://jfrog.okbtsp.com/artifactory/ubuntu-local/pool/focal/gisdesigner12-dev_12.5.0-1_amd64.deb && dpkg -i gisdesigner12-dev_12.5.0-1_amd64.deb
ARG TMP_DIR=/tmp

# add additional install scripts
ADD install-scripts/ /tmp/install-scripts

# add scriptToolsConsole
RUN wget "https://jfrog.okbtsp.com/artifactory/tools/scriptToolsConsole" -O  "/usr/bin/scriptToolsConsole" && \
    chmod +x /usr/bin/scriptToolsConsole

    
# setup QT && CMAKE ENVINRONMENT
ARG QT_LINK="https://nexus2.okbtsp.com/nexus/service/local/repositories/installers/content/installers/qt-opensource-linux-x64/5/7/qt-opensource-linux-x64/0/qt-opensource-linux-x64-0.run"
ARG QT_FRAMEWORK_FILE=qt-opensource-linux-x64-5.7.0.run

ENV QT_VERSION 5.7
ENV TOOLS_HOME /home/user
ENV Qt5_DIR /home/user/Qt/5.7/gcc_64/lib/cmake/Qt5
ENV QT_QPA_PLATFORM minimal
ENV QT_DIR_PATH $TOOLS_HOME/Qt
ENV PATH $PATH:$QT_DIR_PATH/$QT_VERSION/gcc_64/bin
ENV QT_SELECT qt$QT_VERSION
ENV QTTOOLDIR $QT_DIR_PATH/$QT_VERSION/gcc_64/bin
ENV QTLIBDIR $QT_DIR_PATH/$QT_VERSION/gcc_64/lib

ENV CMAKE_PREFIX_PATH /home/user/Qt/5.7/gcc_64

# download QT and install
RUN wget -q $QT_LINK -O $TMP_DIR/$QT_FRAMEWORK_FILE \
     && chmod a+x $TMP_DIR/$QT_FRAMEWORK_FILE \
     && $TMP_DIR/$QT_FRAMEWORK_FILE  --script $TMP_DIR/install-scripts/qt/autoinstall.js --verbose \
     && rm -Rf $TMP_DIR/$QT_FRAMEWORK_FILE \
     && qtchooser -install qt$QT_VERSION $QT_DIR_PATH/$QT_VERSION/gcc_64/bin/qmake

# setting up TOOLS envinronment
ENV PATH $PATH:$TOOLS_HOME/TSP-DP-ProjectConfigsTools:$TOOLS_HOME/TSP-DP-DependenciesManager:/$TOOLS_HOME/TSP-DP-APIBuilder:$TOOLS_HOME/TSP-DP-TestsRunner

ARG PROJECT_CONFIG_TOOLS_LINK="https://nexus2.okbtsp.com/nexus/service/local/artifact/maven/content?r=Linux&g=linuxx64.TSP-DP-ProjectConfigsTools-Installer.2.2&a=TSP-DP-ProjectConfigsTools-Installer&v=RELEASE&p=run"
ARG DEPENDENCIES_MANAGER_LINK="https://jfrog.okbtsp.com/artifactory/Linux/linuxx64/TSP-DP-DependenciesManager-Installer/2/0/TSP-DP-DependenciesManager-Installer/[RELEASE]/TSP-DP-DependenciesManager-Installer-[RELEASE].run"
ARG API_BUILDER_LINK="https://nexus2.okbtsp.com/nexus/service/local/artifact/maven/content?r=Linux&g=linuxx64.TSP-DP-APIBuilder-Installer.2.1&a=TSP-DP-APIBuilder-Installer&v=RELEASE&p=run"
ARG TESTS_RUNNER_LINK="https://nexus2.okbtsp.com/nexus/service/local/artifact/maven/content?r=Linux&g=linuxx64.TSP-DP-TestsRunner-Installer.2.0&a=TSP-DP-TestsRunner-Installer&v=RELEASE&p=run"

ARG TOOLS_INSTALLER=${TMP_DIR}/install-scripts/tools-installer.sh
RUN ls -la ${TMP_DIR}/install-scripts

RUN  $TOOLS_INSTALLER $PROJECT_CONFIG_TOOLS_LINK TSP-DP-ProjectConfigsTools \
     && ${TOOLS_INSTALLER} $DEPENDENCIES_MANAGER_LINK TSP-DP-DependenciesManager \
     && ${TOOLS_INSTALLER} $API_BUILDER_LINK TSP-DP-APIBuilder \
     && ${TOOLS_INSTALLER} $TESTS_RUNNER_LINK TSP-DP-TestsRunner \
     && rm -Rf $TMP_DIR/TSP-DP-DependenciesManager.run $TMP/TSP-DP-ProjectConfigsTools.run $TMP/TSP-DP-APIBuilder.run $TMP/TSP-DP-TestsRunner.run

# fixing executables of apign and testst-runner-d
RUN chmod a+x $TOOLS_HOME/TSP-DP-APIBuilder/apign && chmod a+x $TOOLS_HOME/TSP-DP-TestsRunner/TestsRunner-d

RUN groupmod -g 998 docker \
     && usermod -aG docker ${BAMBOO_USER}

RUN groupadd -g 999 docker19 \
     && usermod -aG docker19 ${BAMBOO_USER}

ENV QT_IFW_LINK="http://download.qt.io/official_releases/qt-installer-framework/3.2.2/QtInstallerFramework-linux-x64.run"
ENV QT_IFW_PATH=$TOOLS_HOME/Qt_IFW
ENV PATH=$PATH:$QT_IFW_PATH
ENV LANGUAGE ru_RU.UTF-8
ENV LANG ru_RU.UTF-8
ENV LC_ALL ru_RU.UTF-8
RUN locale-gen ru_RU.UTF-8 && dpkg-reconfigure locales
RUN wget -q $QT_IFW_LINK -O $TMP_DIR/IFWinstaller.run \
	 && ls -la ${TMP_DIR} && chmod +x $TMP_DIR/IFWinstaller.run  \ 
	&& $TMP_DIR/IFWinstaller.run --script $TMP_DIR/install-scripts/IFW/autoinstall.js \
	&& rm -Rf $TMP_DIR/IFWinstaller.run

RUN wget "https://jfrog.okbtsp.com/artifactory/ubuntu-local/pool/bionic/fakeit_2.0.9.deb" && \
     dpkg -i fakeit_2.0.9.deb && rm fakeit_2.0.9.deb
USER ${BAMBOO_USER}     