function Controller() {
    installer.autoRejectMessageBoxes();

    installer.installationFinished.connect(function() {
        gui.clickButton(buttons.NextButton);
    });
	console.log("Starting installation of Qt!!!");
}

Controller.prototype.WelcomePageCallback = function() {
    gui.clickButton(buttons.NextButton, 10000);
}

Controller.prototype.CredentialsPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.IntroductionPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.TargetDirectoryPageCallback = function() {
    gui.currentPageWidget().TargetDirectoryLineEdit.setText(installer.environmentVariable('TOOLS_HOME') + 'Qt');
    gui.currentPageWidget().TargetDirectoryLineEdit.setText('/home/user/Qt');
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.ComponentSelectionPageCallback = function() {
    var widget = gui.currentPageWidget();

    // widget.deselectAll();

    widget.selectComponent("qt.57");
    widget.selectComponent("qt.57.gcc_64");
    widget.selectComponent("qt.57.qtscript.gcc_64");
    widget.selectComponent("qt.57.qtcharts.gcc_64");
    widget.selectComponent("qt.57.qtserialbus.gcc_64");
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.LicenseAgreementPageCallback = function() {
    gui.currentPageWidget().AcceptLicenseRadioButton.setChecked(true);

    gui.clickButton(buttons.NextButton);
}

Controller.prototype.StartMenuDirectoryPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.ReadyForInstallationPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.PerformInstallationPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.FinishedPageCallback = function() {
    var checkBoxForm = gui.currentPageWidget().LaunchQtCreatorCheckBoxForm;

    if (checkBoxForm && checkBoxForm.launchQtCreatorCheckBox)
        checkBoxForm.launchQtCreatorCheckBox.checked = false;

    gui.clickButton(buttons.FinishButton);
}