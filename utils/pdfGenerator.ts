import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export const generatePDF = async (title: string, htmlContent: string) => {
    try {
        const { uri } = await Print.printToFileAsync({
            html: `
                <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
                            h1 { color: #2874F0; border-bottom: 2px solid #2874F0; padding-bottom: 10px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                            th { background-color: #f2f2f2; font-weight: bold; }
                            .status-active { color: green; font-weight: bold; }
                            .status-disabled { color: red; font-weight: bold; }
                            .footer { margin-top: 30px; font-size: 10px; color: #777; text-align: center; }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        ${htmlContent}
                        <div class="footer">
                            Generated on ${new Date().toLocaleString()} | Ecommerce Admin Portal
                        </div>
                    </body>
                </html>
            `,
        });

        if (Platform.OS === 'ios') {
            await Sharing.shareAsync(uri);
        } else {
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

export const categoriesToHTML = (categories: any[]) => {
    let rows = categories.map((cat, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${cat.name}</td>
            <td class="${cat.isActive ? 'status-active' : 'status-disabled'}">
                ${cat.isActive ? 'Active' : 'Disabled'}
            </td>
        </tr>
    `).join('');

    return `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Category Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

export const subcategoriesToHTML = (subcategories: any[]) => {
    let rows = subcategories.map((sub, index) => {
        const catName = typeof sub.category === 'object' ? sub.category?.name : 'Unknown';
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${sub.name}</td>
                <td>${catName}</td>
                <td class="${sub.isActive ? 'status-active' : 'status-disabled'}">
                    ${sub.isActive ? 'Active' : 'Disabled'}
                </td>
            </tr>
        `;
    }).join('');

    return `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Subcategory Name</th>
                    <th>Parent Category</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

export const productsToHTML = (products: any[]) => {
    let rows = products.map((prod, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${prod.name}</td>
            <td>₹${prod.price}</td>
            <td>${prod.stock}</td>
            <td class="${prod.isActive ? 'status-active' : 'status-disabled'}">
                ${prod.isActive ? 'Active' : 'Disabled'}
            </td>
        </tr>
    `).join('');

    return `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};
