function Controller() {
    installer.autoRejectMessageBoxes();

    installer.installationFinished.connect(function() {
        gui.clickButton(buttons.NextButton);
    });
	console.log("inited");
}

Controller.prototype.WelcomePageCallback = function() {
    gui.clickButton(buttons.NextButton, 3000);
}

Controller.prototype.IntroductionPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.TargetDirectoryPageCallback = function() {
    
    gui.currentPageWidget().TargetDirectoryLineEdit.setText("/home/user/Qt_IFW");
    gui.clickButton(buttons.NextButton);
}


Controller.prototype.LicenseAgreementPageCallback = function() {
    gui.currentPageWidget().AcceptLicenseRadioButton.setChecked(true);

    gui.clickButton(buttons.NextButton);
}

Controller.prototype.ReadyForInstallationPageCallback = function() {
    gui.clickButton(buttons.NextButton);
}

Controller.prototype.FinishedPageCallback = function() {
    gui.clickButton(buttons.FinishButton);
}

