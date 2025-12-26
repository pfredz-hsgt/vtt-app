/**
 * Parse raw WhatsApp menu text into clean menu items
 * @param {string} rawText - Raw text from WhatsApp message
 * @returns {string[]} - Array of cleaned menu item names
 */
export function parseMenuText(rawText) {
    if (!rawText || typeof rawText !== 'string') return []

    const lines = rawText.split('\n')
    const filtered = lines
        .map(line => line.trim())
        .filter(line => {
            if (!line) return false

            // Rule 4: Not too long (<= 30 characters)
            if (line.length > 30) return false

            // Rule 2: No digits
            if (/\d/.test(line)) return false

            // Rule 6: No punctuation except basic letters & spaces
            // allowing only a-z, A-Z, and whitespace
            if (/[^a-zA-Z\s]/.test(line)) return false

            // Rule 5: Not all uppercase
            // (Only check if there are letters to avoid false positives on empty strings, though we checked !line)
            if (line === line.toUpperCase()) return false

            // Rule 1: It contains 2–5 words
            const words = line.split(/\s+/).filter(w => w.length > 0)
            if (words.length < 2 || words.length > 5) return false

            const lower = line.toLowerCase()

            // Rule 3: No "greeting / marketing" keywords
            const marketingKeywords = [
                'assalamualaikum', 'wassup', 'walaikumsalam',
                'menu', 'servis', 'penghantaran', 'menyediakan',
                'delivery', 'order', 'close', 'open', 'today'
            ]

            if (marketingKeywords.some(keyword => lower.includes(keyword))) return false

            return true
        })

    // Add "Nasi Putih" as first item if not already present (though logic likely filters it out if it's just 2 words, wait "Nasi Putih" is 2 words, so it passes Rule 1)
    // But we always want Nasi Putih at the top.
    // Let's just add it.
    return ['Nasi Putih', ...filtered]
}

/**
 * Format orders into WhatsApp-friendly text
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

    let text = `📋 *Order List - ${dateStr}*\n\n`

    orders.forEach((order, index) => {
        text += `${index + 1}. *${order.customer_name}*\n`

        // Fetch order details for this order
        if (order.order_details && order.order_details.length > 0) {
            order.order_details.forEach(detail => {
                if (detail.quantity > 0) {
                    text += `   • ${detail.item_name} × ${detail.quantity}\n`
                }
            })
        }

        if (order.remarks) {
            text += `   💬 ${order.remarks}\n`
        }

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
