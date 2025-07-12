// main.js - Fully Functional CognitoSketch Script (UPDATED VERSION 5.0 - Fixing Text Content & Color Parsing)

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("uiDescriptionInput");
    const generateBtn = document.getElementById("generateButton");
    const clearBtn = document.getElementById("clearButton");
    const previewArea = document.getElementById("uiPreviewArea");
    const codeArea = document.getElementById("generatedCodeArea");

    generateBtn.addEventListener("click", handleGenerateUI);
    clearBtn.addEventListener("click", handleClear);

    function handleGenerateUI() {
        const description = input.value.trim();
        if (!description) {
            previewArea.innerHTML = "<p class='placeholder-text'>Please enter a description.</p>"; // Use placeholder class
            codeArea.innerHTML = "<p class='placeholder-text'>Generated code will appear here</p>"; // Use placeholder class
            return;
        }

        const props = parseDescriptionToUIProps(description);
        const { html, css } = generateHTMLAndCSS(props);

        // Render UI
        previewArea.innerHTML = html;

        // Render Code with copy button
        codeArea.innerHTML = `<pre><code>${escapeHtml(html)}\n\n/* CSS Styles */\n${escapeHtml(css)}</code></pre>
                              <button id="copyCodeBtn">Copy Code</button>`;

        const copyBtn = document.getElementById("copyCodeBtn");
        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(`${html}\n\n/* CSS Styles */\n${css}`);
                copyBtn.textContent = "Copied!";
                setTimeout(() => (copyBtn.textContent = "Copy Code"), 1500);
            });
        }
    }

    function handleClear() {
        input.value = "";
        previewArea.innerHTML = "<p class='placeholder-text'>Your preview will appear here</p>"; // Reset with placeholder
        codeArea.innerHTML = "<p class='placeholder-text'>Generated code will appear here</p>"; // Reset with placeholder
    }

    function parseDescriptionToUIProps(desc) {
        const props = {
            elementType: "div", // Default to div if no specific element is matched
            textContent: "",
            backgroundColor: "var(--color-background-medium)", // Default to a theme variable
            textColor: "var(--color-text-dark)", // Default to a theme variable
            fontSize: "var(--font-size-base)", // Default to a theme variable
            shape: "var(--border-radius-md)", // Default to a theme variable
            alignment: "left",
            padding: "var(--space-sm) var(--space-md)", // Default to theme variable
            margin: "var(--space-md) 0", // Default to theme variable
            border: false,
            shadow: false,
            src: "", // For images
            inputType: "text", // For inputs
            href: "#" // For links
        };

        const lowerDesc = desc.toLowerCase();

        // 1. Determine Element Type (most specific matches first)
        if (lowerDesc.includes("button") || lowerDesc.includes("btn")) {
            props.elementType = "button";
        } else if (lowerDesc.includes("heading") || lowerDesc.includes("h1") || lowerDesc.includes("h2") || lowerDesc.includes("h3") || lowerDesc.includes("title")) {
            if (lowerDesc.includes("h1")) props.elementType = "h1";
            else if (lowerDesc.includes("h2")) props.elementType = "h2";
            else if (lowerDesc.includes("h3")) props.elementType = "h3";
            else props.elementType = "h1";
        } else if (lowerDesc.includes("paragraph") || lowerDesc.includes("p tag") || lowerDesc.includes("text block") || lowerDesc.includes("body text")) {
            props.elementType = "p";
        } else if (lowerDesc.includes("input") || lowerDesc.includes("text field") || lowerDesc.includes("text box")) {
            props.elementType = "input";
            if (lowerDesc.includes("password input")) props.inputType = "password";
            else if (lowerDesc.includes("email input")) props.inputType = "email";
            else if (lowerDesc.includes("number input")) props.inputType = "number";
            else if (lowerDesc.includes("date input")) props.inputType = "date";
        } else if (lowerDesc.includes("textarea") || lowerDesc.includes("multi-line text input") || lowerDesc.includes("long text box")) {
            props.elementType = "textarea";
        } else if (lowerDesc.includes("image") || lowerDesc.includes("img") || lowerDesc.includes("picture")) {
            props.elementType = "img";
            const srcMatch = desc.match(/src\s*['"](.*?)['"]/i);
            if (srcMatch && srcMatch[1]) {
                props.src = srcMatch[1];
            } else {
                props.src = "https://via.placeholder.com/150";
            }
        } else if (lowerDesc.includes("link") || lowerDesc.includes("a tag") || lowerDesc.includes("hyperlink")) {
            props.elementType = "a";
            const hrefMatch = desc.match(/href\s*['"](.*?)['"]/i);
            if (hrefMatch && hrefMatch[1]) {
                props.href = hrefMatch[1];
            }
        } else if (lowerDesc.includes("keyboard") || lowerDesc.includes("kbd") || lowerDesc.includes("key")) {
            props.elementType = "kbd";
        } else if (lowerDesc.includes("list item") || lowerDesc.includes("li")) {
            props.elementType = "li";
        } else if (lowerDesc.includes("list") || lowerDesc.includes("ul")) {
            props.elementType = "ul";
            if (!lowerDesc.includes("empty")) {
                props.textContent = "<li>Item 1</li><li>Item 2</li>";
            }
        } else if (lowerDesc.includes("span") || lowerDesc.includes("inline text") || lowerDesc.includes("highlight")) {
            props.elementType = "span";
        }


        // 2. Parse Text Content (can apply to various elements) - IMPROVED REGEX
        // This regex tries to capture text after 'text', 'content', 'value', or 'label'.
        // It looks for optional quotes and then captures anything until another keyword or end of string.
        const textMatch = desc.match(/(?:text|content|value|label)\s*(?:is\s*)?(?:['"](.*?)['"]|(\b[\w\s.-]+\b(?=\s*(?:with|and|a|an|the|\s*$))))/i);
        if (textMatch) {
            // Group 1 is for quoted text, Group 2 for unquoted text
            props.textContent = textMatch[1] || textMatch[2] || '';
            props.textContent = props.textContent.trim(); // Trim any leading/trailing spaces
        }

        // Apply default text content if still empty
        if (!props.textContent) {
            if (props.elementType === "button") {
                props.textContent = "Click Me";
            } else if (props.elementType.startsWith("h")) {
                props.textContent = "Page Heading";
            } else if (props.elementType === "p") {
                props.textContent = "This is a paragraph of text.";
            } else if (props.elementType === "a") {
                props.textContent = "Learn More";
            } else if (props.elementType === "kbd") {
                props.textContent = "Ctrl + K";
            } else if (props.elementType === "textarea") {
                props.textContent = "Enter your message here...";
            } else if (props.elementType === "span") {
                props.textContent = "Highlighted Text";
            } else if (props.elementType === "div") {
                 props.textContent = "Generic Div Content";
            }
        }


        // 3. Parse Colors to CSS Variables - IMPROVED LOGIC
        const colorVarMap = {
            "light blue": "var(--color-primary)",
            "dark blue": "var(--color-primary-dark)",
            "blue": "var(--color-primary)",
            "green": "var(--color-code-text)",
            "dark green": "var(--color-code-text-dark)", // Ensure this is defined in CSS or use hex
            "red": "var(--color-red, #FF4C4C)", // Fallback hex if --color-red not defined
            "dark red": "var(--color-dark-red, #8B0000)", // Fallback hex
            "purple": "var(--color-purple, #800080)", // Fallback hex
            "orange": "var(--color-orange, #FFA500)", // Fallback hex
            "yellow": "var(--color-yellow, #FFFF00)", // Fallback hex
            "white": "var(--color-text-light)",
            "black": "var(--color-text-dark)",
            "grey": "var(--color-secondary)",
            "gray": "var(--color-secondary)",
            "light grey": "var(--color-secondary-light)",
            "dark grey": "var(--color-secondary-dark)",
        };

        let foundBgColor = false;
        let foundTextColor = false;

        // First pass: look for explicit "X background" or "X text"
        for (const [key, value] of Object.entries(colorVarMap)) {
            if (lowerDesc.includes(`${key} background`)) {
                props.backgroundColor = value;
                foundBgColor = true;
            }
            if (lowerDesc.includes(`${key} text`)) {
                props.textColor = value;
                foundTextColor = true;
            }
        }

        // Second pass: if background color not found, check for general color mention
        if (!foundBgColor) {
            for (const [key, value] of Object.entries(colorVarMap)) {
                // If the description includes just the color word (e.g., "blue button")
                if (lowerDesc.includes(key) && !lowerDesc.includes(`${key} text`)) { // Ensure it's not explicitly for text
                    // Heuristic: If it's a block-level element or a button, assume color applies to background
                    if (['button', 'div', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'textarea'].includes(props.elementType)) {
                        props.backgroundColor = value;
                        foundBgColor = true;
                    }
                    // For input, image, kbd, link, span - might not be ideal for background by default unless specified
                    break; // Stop after first general color match for background
                }
            }
        }

        // Third pass: if text color not found, and element is text-heavy, check for general color mention
        if (!foundTextColor) {
            for (const [key, value] of Object.entries(colorVarMap)) {
                // If the description includes just the color word (e.g., "red heading")
                // And it's a text-heavy element
                if (lowerDesc.includes(key) && !lowerDesc.includes(`${key} background`)) { // Ensure it's not explicitly for background
                    if (['h1', 'h2', 'h3', 'p', 'a', 'span', 'kbd'].includes(props.elementType)) {
                         props.textColor = value;
                         foundTextColor = true;
                    }
                    break; // Stop after first general color match for text
                }
            }
        }

        // 4. Parse Font Sizes to CSS Variables
        const fontSizeMap = {
            "small": "14px", // Keeping these as fixed px for now, or map to new variables like --font-size-sm, --font-size-lg
            "medium": "var(--font-size-base)",
            "large": "20px",
            "extra large": "24px",
            "xl": "24px",
            "huge": "32px"
        };
        const fontSizeMatch = desc.match(/(\d+)(px|rem)? font size|font size (\d+)(px|rem)?/i); // Example: "20px font size"
        const specificSizeMatch = desc.match(/(small|medium|large|extra large|xl|huge) font|text/i); // Example: "large font"

        if (fontSizeMatch) {
            props.fontSize = `${fontSizeMatch[1] || fontSizeMatch[3]}${fontSizeMatch[2] || fontSizeMatch[4] || 'px'}`;
        } else if (specificSizeMatch) {
            props.fontSize = fontSizeMap[specificSizeMatch[1]] || props.fontSize;
        }

        // 5. Parse Shapes (Border Radius) to CSS Variables
        const shapeMap = {
            "rounded": "var(--border-radius-md)",
            "circular": "50%",
            "circle": "50%",
            "pill": "var(--border-radius-full)",
            "oval": "var(--border-radius-full)",
            "square": "0",
            "sharp corners": "0"
        };
        const borderRadiusMatch = desc.match(/(\d+)px rounded|border radius (\d+)px/i);
        if (borderRadiusMatch) {
            props.shape = `${borderRadiusMatch[1] || borderRadiusMatch[2]}px`;
        } else {
            for (const [key, value] of Object.entries(shapeMap)) {
                if (lowerDesc.includes(key)) {
                    props.shape = value;
                    break;
                }
            }
        }


        // 6. Parse Shadow to CSS Variables
        if (lowerDesc.includes("strong shadow")) props.shadow = "var(--shadow-lg)";
        else if (lowerDesc.includes("shadow") || lowerDesc.includes("elevated")) props.shadow = "var(--shadow-md)";
        else if (lowerDesc.includes("no shadow")) props.shadow = false;

        // 7. Parse Alignment (no change, as it's not a variable)
        if (lowerDesc.includes("centered") || lowerDesc.includes("center aligned")) props.alignment = "center";
        else if (lowerDesc.includes("right aligned")) props.alignment = "right";
        else if (lowerDesc.includes("left aligned")) props.alignment = "left";

        // 8. Parse Border (no change to variable integration for custom border string)
        const borderMatch = desc.match(/(\d+)(px)?\s+(solid|dashed|dotted)\s+([a-zA-Z0-9#]+)\s+border/i);
        if (borderMatch) {
            props.border = `${borderMatch[1]}px ${borderMatch[3]} ${borderMatch[4]}`; // Hex color for border is fine here
        } else if (lowerDesc.includes("with border") || lowerDesc.includes("bordered")) props.border = "1px solid var(--color-border)"; // Use border variable
        else if (lowerDesc.includes("dashed border")) props.border = "1px dashed var(--color-border)";
        else if (lowerDesc.includes("thick border")) props.border = "2px solid var(--color-text-dark)"; // Use dark text for thick border
        else if (lowerDesc.includes("no border")) props.border = false;


        // 9. Parse Padding and Margin to CSS Variables
        const paddingMarginMap = {
            "small": "var(--space-sm)",
            "medium": "var(--space-md)",
            "large": "var(--space-lg)",
            "extra large": "var(--space-xl)"
        };
        const paddingMatch = desc.match(/padding\s+(\d+px(?:\s+\d+px){0,3})/i);
        if (paddingMatch) {
            props.padding = paddingMatch[1];
        } else {
            for (const [key, value] of Object.entries(paddingMarginMap)) {
                if (lowerDesc.includes(`${key} padding`)) {
                    props.padding = value;
                    break;
                }
            }
        }

        const marginMatch = desc.match(/margin\s+(\d+px(?:\s+\d+px){0,3})/i);
        if (marginMatch) {
            props.margin = marginMatch[1];
        } else if (lowerDesc.includes("no margin") || lowerDesc.includes("margin 0")) {
            props.margin = "0";
        } else {
            for (const [key, value] of Object.entries(paddingMarginMap)) {
                if (lowerDesc.includes(`${key} margin`)) {
                    props.margin = value;
                    break;
                }
            }
        }
        // No specific change for default margin: "var(--space-md) 0", it will remain if no other margin is specified.


        return props;
    }

    function generateHTMLAndCSS(props) {
        const tag = props.elementType;
        let html = "";
        const content = props.textContent || "";

        let displayStyle = "display: inline-block;";
        if (tag === "div" || tag === "p" || tag.startsWith("h") || tag === "ul" || tag === "li" || tag === "textarea") {
            displayStyle = "display: block;";
        } else if (tag === "input" || tag === "img" || tag === "span" || tag === "a" || tag === "kbd") {
            displayStyle = "display: inline-block;";
        }


        const styles = `
            background-color: ${props.backgroundColor};
            color: ${props.textColor};
            font-size: ${props.fontSize};
            border-radius: ${props.shape};
            padding: ${props.padding};
            margin: ${props.margin};
            text-align: ${props.alignment};
            ${props.shadow ? `box-shadow: ${props.shadow};` : ""}
            border: ${props.border ? props.border : "none"};
            ${displayStyle}
            box-sizing: border-box;
            min-height: ${tag === "input" || tag === "textarea" ? "38px" : "auto"};
            min-width: ${tag === "input" || tag === "textarea" ? "150px" : "auto"};
            width: ${tag === "textarea" ? "calc(100% - 32px)" : "auto"};
            vertical-align: top;
        `;

        if (tag === "img") {
            html = `<img src="${props.src || 'https://via.placeholder.com/150'}" alt="${content || 'generated image'}" style="${styles}">`;
        } else if (tag === "input") {
            html = `<input type="${props.inputType}" placeholder="${content || 'Enter text...'}" value="${props.textContent}" style="${styles}">`;
        } else if (tag === "textarea") {
            html = `<textarea rows="4" placeholder="${content || 'Type here...'}" style="${styles}">${content}</textarea>`;
        } else if (tag === "a") {
            html = `<a href="${props.href || '#'}" style="${styles}">${content}</a>`;
        } else if (tag === "kbd") {
            html = `<kbd style="${styles}">${content || "Ctrl + K"}</kbd>`;
        } else if (tag === "span") {
            html = `<span style="${styles}">${content}</span>`;
        } else {
            html = `<${tag} style="${styles}">${content}</${tag}>`;
        }

        return { html, css: styles.trim() };
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});