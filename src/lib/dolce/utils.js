/**
 * Parse WhatsApp menu into structured JSON with Categories and Prices
 * @param {string} rawText - Raw text from WhatsApp
 * @returns {Array} - Array of Category objects containing items
 */
export function parseMenuText(rawText) {
    if (!rawText || typeof rawText !== 'string') return []

    const lines = rawText.split('\n')

    // The final structure we want to return
    let menu = [];

    // State variables
    let currentCategory = { category: 'General', items: [] };
    let hasStartedCapturing = false;

    // Regex Definitions
    const separatorRegex = /^["'=\-_]{3,}$/; // Detects """""""""""
    const priceRegex = /(?:RM|Rm)\s*(\d+(?:\.\d{1,2})?)/i; // Detects RM 8.50, RM8, Rm 4
    const marketingKeywords = ['menu daily', 'vendor', 'est dolce', 'delivery', 'order', 'close', 'open', 'today'];

    // Helper to finalize a section and start a new one
    const saveCurrentCategory = () => {
        if (currentCategory.items.length > 0) {
            menu.push(currentCategory);
        }
        currentCategory = { category: 'General', items: [] };
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // 1. Skip empty lines
        if (!line) continue;

        // 2. Remove invisible unicode chars
        line = line.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');

        // 3. Check for Separators ("""""""")
        // If we see a separator, it usually means the LINE BEFORE it was a Header
        if (separatorRegex.test(line)) {
            // If the previous line exists and wasn't processed as an item
            if (i > 0) {
                const potentialHeader = lines[i - 1].trim();
                // If we haven't saved the previous section yet, do it now
                // (This logic handles the fact that we might have processed the header line as "garbage" previously)

                // Reset the current category to the new header name
                saveCurrentCategory(); // Save whatever we had before
                currentCategory.category = potentialHeader.replace(/["']/g, ''); // Clean quotes from header
                hasStartedCapturing = true;
            }
            continue;
        }

        // 4. Check for Excluded Keywords (Metadata at top of message)
        const lower = line.toLowerCase();
        if (!hasStartedCapturing && marketingKeywords.some(k => lower.includes(k))) {
            continue;
        }

        // 5. DETECT ITEMS (Must have a Price OR start with a Number)
        const priceMatch = line.match(priceRegex);
        const startsWithNumber = /^\d+[\.\)\s]/.test(line);

        if (priceMatch || startsWithNumber) {
            // -- EXTRACT PRICE --
            let priceStr = '0.00';
            if (priceMatch) {
                // Parse float and fix to 2 decimal places
                const priceVal = parseFloat(priceMatch[1]);
                priceStr = priceVal.toFixed(2);
            }

            // -- EXTRACT ID (if exists) --
            // If line starts with "1.", extract that as ID, otherwise generate generic ID
            let id = '';
            const idMatch = line.match(/^(\d+)\./);
            if (idMatch) id = idMatch[1];

            // -- CLEAN ITEM NAME --
            // Remove the Price (RM...)
            let name = line.replace(/\(?\brm\s*[\d\.]+\)?/gi, '');
            // Remove the Leading Number (1.)
            name = name.replace(/^\d+\s*[\.\)]\s*/, '');
            // Remove clean-up chars
            name = name.replace(/["']+/g, '').trim();
            // Remove trailing dots
            name = name.replace(/\.$/, '');

            if (name.length > 2) {
                currentCategory.items.push({
                    id: id,
                    name: name,
                    price: `RM ${priceStr}`
                });
                hasStartedCapturing = true;
            }
        }
        else {
            // If it's not a separator and not an item, it might be a header for the NEXT separator.
            // We do nothing here, the next iteration's "Separator Check" will look back at this line.

            // Edge case: Bottom of menu "LAUK PAUK" might not have separator lines in some copies.
            // If line is ALL CAPS and short, treat as implicit header? 
            // For now, relying on separator logic is safer for this dataset.
        }
    }

    // Push the final category after loop ends
    saveCurrentCategory();

    return menu;
}
/**
 * Format orders into WhatsApp-friendly text
 * Updated to include Price, Delivery Status, and Address
 * @param {Array} orders - Array of order objects
 * @param {string} menuDate - Date of the menu
 * @returns {string} - Formatted text for WhatsApp
 */
export function formatOrdersForWhatsApp(orders, menuDate) {
    if (!orders || orders.length === 0) return 'No orders yet.'

    const dateStr = new Date(menuDate).toLocaleDateString('ms-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Calculate Grand Total for the whole list
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    let text = `📋 *Order List - ${dateStr}*\n`
    text += `💰 *Total Collected: RM ${totalRevenue.toFixed(2)}*\n\n`

    orders.forEach((order, index) => {
        // 1. Prepare Header: "1. Name (RM 10.00) 🚚"
        const priceTag = order.total_amount
            ? `(RM ${parseFloat(order.total_amount).toFixed(2)})`
            : '';
        const deliveryTag = order.is_delivery ? ' 🚚' : '';

        text += `${index + 1}. *${order.customer_name}* ${priceTag}${deliveryTag}\n`

        // 2. List Items
        if (order.order_details && order.order_details.length > 0) {
            order.order_details.forEach(detail => {
                if (detail.quantity > 0) {
                    const itemPrice = detail.price ? `(RM ${parseFloat(detail.price).toFixed(2)}) ` : '';
                    text += `   • ${detail.item_name} ${itemPrice}× ${detail.quantity}\n`
                }
            })
        }

        // 3. Show Address (Only if delivery)
        if (order.is_delivery && order.delivery_address) {
            text += `   📍 ${order.delivery_address}`
            if (order.phone_number) {
                text += ` (📞 ${order.phone_number})`
            }
            text += `\n`
        }

        // 4. Show Remarks
        if (order.remarks) {
            text += `   📝 ${order.remarks}\n`
        }

        // 5. Paid Status
        if (order.is_paid) {
            text += `   ✅ Paid\n`
        }

        text += '\n'
    })

    return text
}
/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        console.error('Failed to copy:', err)
        return false
    }
}
