import { copyToClipboard, showToast } from '../utils.js';

export function render() {
    return `
        <div class="tool-grid-1" style="max-width: 800px; margin: 0 auto; width: 100%;">
            <div class="pane">
                <div class="pane-header">
                    <h3>Password Generator</h3>
                    <button class="btn btn-secondary btn-icon" id="btnCopyPassword">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy
                    </button>
                </div>
                <div class="editor-container" style="padding: var(--spacing-xl); display: flex; flex-direction: column; gap: var(--spacing-lg); overflow-y: auto;">
                    <div style="font-family: var(--font-mono); font-size: 1.5rem; padding: var(--spacing-lg); background: var(--bg-elevated); border-radius: var(--radius-md); text-align: center; word-break: break-all; min-height: 80px; border: 1px solid var(--border-strong); display: flex; align-items: center; justify-content: center; user-select: text;" id="passwordOutput"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--spacing-md);">
                        <label style="font-weight: 600; font-size: 0.95rem; letter-spacing: 0.5px; text-transform: uppercase;">PASSWORD LENGTH: <span id="pwdLengthVal">16</span></label>
                    </div>
                    <input type="range" id="pwdLength" min="4" max="64" value="16" style="width: 100%; cursor: pointer;">

                    <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-family: var(--font-mono); font-size: 1.05rem;">
                            <input type="checkbox" id="chkUpper" checked style="width: 18px; height: 18px;"> Include Uppercase (A-Z)
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-family: var(--font-mono); font-size: 1.05rem;">
                            <input type="checkbox" id="chkLower" checked style="width: 18px; height: 18px;"> Include Lowercase (a-z)
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-family: var(--font-mono); font-size: 1.05rem;">
                            <input type="checkbox" id="chkNumbers" checked style="width: 18px; height: 18px;"> Include Numbers (0-9)
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-family: var(--font-mono); font-size: 1.05rem;">
                            <input type="checkbox" id="chkSymbols" checked style="width: 18px; height: 18px;"> Include Symbols (!@#$%^&*)
                        </label>
                    </div>

                    <button class="btn btn-primary" id="btnGeneratePassword" style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); font-weight: 600; font-size: 1.1rem;">Generate Password</button>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const passwordOutput = workspace.querySelector('#passwordOutput');
    const pwdLength = workspace.querySelector('#pwdLength');
    const pwdLengthVal = workspace.querySelector('#pwdLengthVal');
    const chkUpper = workspace.querySelector('#chkUpper');
    const chkLower = workspace.querySelector('#chkLower');
    const chkNumbers = workspace.querySelector('#chkNumbers');
    const chkSymbols = workspace.querySelector('#chkSymbols');
    const btnGeneratePassword = workspace.querySelector('#btnGeneratePassword');
    const btnCopyPassword = workspace.querySelector('#btnCopyPassword');

    actionsContainer.innerHTML = '';

    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBERS = '0123456789';
    const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    const generatePassword = () => {
        let charset = '';
        if (chkUpper.checked) charset += UPPER;
        if (chkLower.checked) charset += LOWER;
        if (chkNumbers.checked) charset += NUMBERS;
        if (chkSymbols.checked) charset += SYMBOLS;

        if (!charset) {
            passwordOutput.textContent = 'Select at least 1 type';
            return;
        }

        const length = parseInt(pwdLength.value, 10);
        let passwordArray = [];

        if (chkUpper.checked) passwordArray.push(UPPER[Math.floor(Math.random() * UPPER.length)]);
        if (chkLower.checked) passwordArray.push(LOWER[Math.floor(Math.random() * LOWER.length)]);
        if (chkNumbers.checked) passwordArray.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
        if (chkSymbols.checked) passwordArray.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);

        for (let i = passwordArray.length; i < length; i++) {
            passwordArray.push(charset[Math.floor(Math.random() * charset.length)]);
        }

        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }

        passwordOutput.textContent = passwordArray.join('');
    };

    pwdLength.addEventListener('input', (e) => {
        pwdLengthVal.textContent = e.target.value;
        generatePassword();
    });

    [chkUpper, chkLower, chkNumbers, chkSymbols].forEach(chk => {
        chk.addEventListener('change', generatePassword);
    });

    btnGeneratePassword.addEventListener('click', generatePassword);

    btnCopyPassword.addEventListener('click', () => {
        if (passwordOutput.textContent && passwordOutput.textContent !== 'Select at least 1 type') {
            copyToClipboard(passwordOutput.textContent);
        } else {
            showToast('No valid password to copy', 'error');
        }
    });

    generatePassword();
}
