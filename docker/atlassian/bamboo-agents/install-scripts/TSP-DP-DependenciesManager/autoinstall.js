function Controller() {
    installer.autoRejectMessageBoxes();

    installer.installationFinished.connect(function() {
        gui.clickButton(buttons.NextButton);
    });
        console.log("Starting installation of ProjectConfigsTools in silent mode!!!");
}

Controller.prototype.WelcomePageCallback = function() {
    gui.clickButton(buttons.NextButton, 1000);
}
Controller.prototype.IntroductionPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.TargetDirectoryPageCallback = function() {
    gui.currentPageWidget().TargetDirectoryLineEdit.setText(installer.environmentVariable('TOOLS_HOME') + '/' + installer.value('Name'));
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.ComponentSelectionPageCallback = function() {
    var widget = gui.currentPageWidget();
    widget.selectComponent("com.spllcokbtsp.dependenciesmanager");
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.StartMenuDirectoryPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.ReadyForInstallationPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.FinishedPageCallback = function() {
    gui.clickButton(buttons.FinishButton);
}