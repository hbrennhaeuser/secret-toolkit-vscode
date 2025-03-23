import * as vscode from 'vscode';
import { passwordGenerator, hexGenerator} from './password';
import { getEntropy } from './entropy';


export async function command_password_entropy() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("No active editor found!");
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);
    if (!text) {
        vscode.window.showWarningMessage("No text selected!");
        return;
    }

    // return entropy("text");
    let {entropy, rating} = getEntropy(text);
    const entropyMessage = `Secret-Toolkit: Password entropy: ${entropy} (${rating})`;
    vscode.window.showInformationMessage(entropyMessage); // Display as a message
}



export async function command_password_generator_preset() {
    const config = vscode.workspace.getConfiguration("secret-toolkit-vscode");
    const presets: { 
        id: string;
        description: string;
        type: string;
        length?: number;
        defaultLength?: number,
        bytes?: number;
        defaultBytes?: number,
        lowercase?: number;
        uppercase?: number;
        numbers?: number;
        specialReduced?: number;
        specialAll?: number;
        custom?: number;
        customCharacters?: string;
        avoidAmbiguous?: boolean;
        encode?: string;
    }[] = config.get("presets", []);
     
    if (presets.length === 0) {
        vscode.window.showWarningMessage("No presets found! Add some in your settings.");
        return;
    }

    const presetsList = presets.map(preset => ({
        label: preset.id,
        description: preset.description ?? `Type: ${preset.type}, Length: ${preset.length}`
    }));

    const selectedPresetListEntry = await vscode.window.showQuickPick(presetsList, {
        placeHolder: 'Select a preset',
        canPickMany: false
    });

    if (!selectedPresetListEntry) {
        vscode.window.showWarningMessage("No preset selected!");
        return;
    }

    // vscode.window.showInformationMessage(`Secret-Toolkit: preset selected: ${selectedPresetListEntry['label']}`); 

    const preset = presets.find(p => p.id === selectedPresetListEntry.label);

    if (!preset) {
        vscode.window.showWarningMessage("Preset not found!");
        return;
    }

    let out;
    if (preset.type === "password" ){

        // if no length is specified or its 0 prompt user
        let length: number;
        if (!preset.length || preset.length === 0){
            const defaultLength = preset.defaultLength ?? 16;
    
            const inputLength = await vscode.window.showInputBox({
                prompt: 'Enter the length of the password',
                value: defaultLength.toString(),
                validateInput: (value) => {
                    const parsed = parseInt(value, 10);
                    if (isNaN(parsed) || parsed <= 0) {
                        return 'Please enter a valid positive number';
                    }
                    return null;
                }
            });
            length = inputLength ? parseInt(inputLength, 10) : 0;
        } else {
            length = preset.length;
        }

        // generate password
        out = passwordGenerator(
            length, 
            {
                lowercase: preset.lowercase ?? 0,
                uppercase: preset.uppercase ?? 0,
                numbers: preset.numbers ?? 0,
                specialReduced: preset.specialReduced ?? 0,
                specialAll: preset.specialAll ?? 0,
                custom: preset.custom ?? 0,
                customCharacters: preset.customCharacters ?? '',
                avoidAmbiguous: preset.avoidAmbiguous ?? false,
                encode: preset.encode ?? '',
            }
        );
    } else if (preset.type === "hex" ){
        out=hexGenerator(preset.bytes);
    } else {
        vscode.window.showWarningMessage("Invalid preset mode!");
        return;
    }

    return out;
}
