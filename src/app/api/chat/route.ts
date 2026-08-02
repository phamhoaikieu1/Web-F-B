import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Danh mục sản phẩm F&B B2B dự phòng nếu chưa có kết nối DB
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'Siro Boduo Đào (Bottle 1L)',
    sku: 'BD-DAO-1L',
    unit: 'Chai',
    base_unit: 'Chai',
    conversion_rate: 24, // 1 Thùng = 24 Chai
    price: 135000,
    cost_price: 95000,
    stock_quantity: 120,
    min_stock_alert: 20,
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    name: 'Hồng Trà Đặc Biệt Lộc Phát (Gói 1kg)',
    sku: 'LP-HT-1KG',
    unit: 'Gói',
    base_unit: 'Gói',
    conversion_rate: 10,
    price: 165000,
    cost_price: 120000,
    stock_quantity: 85,
    min_stock_alert: 15,
  },
  {
    id: 'prod-3',
    category_id: 'cat-2',
    name: 'Bột Kem Béo MT35 (Bao 25kg)',
    sku: 'MT35-25KG',
    unit: 'Bao',
    base_unit: 'Kg',
    conversion_rate: 25,
    price: 1450000,
    cost_price: 1100000,
    stock_quantity: 40,
    min_stock_alert: 5,
  },
  {
    id: 'prod-4',
    category_id: 'cat-2',
    name: 'Trân Châu Đen Master (Gói 3kg)',
    sku: 'TC-MAS-3KG',
    unit: 'Gói',
    base_unit: 'Kg',
    conversion_rate: 6,
    price: 98000,
    cost_price: 70000,
    stock_quantity: 200,
    min_stock_alert: 30,
  },
  {
    id: 'prod-5',
    category_id: 'cat-1',
    name: 'Kem Béo Thực Vật Rich\'s Non-Dairy Creamer (Hộp 454g)',
    sku: 'RICH-454G',
    unit: 'Hộp',
    base_unit: 'Thùng',
    conversion_rate: 24,
    price: 38000,
    cost_price: 29000,
    stock_quantity: 300,
    min_stock_alert: 50,
  },
  {
    id: 'prod-6',
    category_id: 'cat-3',
    name: 'Sốt Vải Torani (Chai 1.89L)',
    sku: 'TOR-VAI-189',
    unit: 'Chai',
    base_unit: 'Chai',
    conversion_rate: 4,
    price: 340000,
    cost_price: 270000,
    stock_quantity: 50,
    min_stock_alert: 10,
  }
]

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Nội dung tin nhắn không hợp lệ' }, { status: 400 })
    }

    // Fetch sản phẩm thực tế từ Supabase
    let productsList = DEFAULT_PRODUCTS
    try {
      const { data: dbProducts } = await supabase.from('products').select('*')
      if (dbProducts && dbProducts.length > 0) {
        productsList = dbProducts
      }
    } catch (e) {
      console.warn('Dùng danh mục sản phẩm F&B mặc định do lỗi DB:', e)
    }

    // Chuẩn bị thông tin danh mục làm Context Injection
    const catalogContext = productsList
      .map(
        (p) =>
          `- ID: ${p.id} | Ten: ${p.name} | Gias: ${Number(p.price).toLocaleString('vi-VN')} d/${p.unit} | Quy doi: 1 Thung = ${p.conversion_rate || 24} ${p.unit} | Ton kho: ${p.stock_quantity}`
      )
      .join('\n')

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    let aiTextResponse = ''
    let recommendedProducts: Array<{
      id: string
      name: string
      unit: string
      price: number
      quantity: number
    }> = []

    // 1. Nếu có GEMINI API KEY -> Gọi Gemini API
    if (apiKey) {
      try {
        const systemInstruction = `Bạn là Trợ lý AI Bán Sỉ F&B chuyên nghiệp của hệ thống nhà cung cấp nguyên liệu pha chế B2B.
Nhiệm vụ của bạn:
1. Tư vấn công thức pha chế, tính toán định lượng nguyên liệu cho các chủ quán cafe/trà sữa (ví dụ: 100 ly/ngày cần bao nhiêu kg trà, bột béo, siro).
2. Giải thích quy đổi đơn vị (ví dụ: mua lẻ 1 chai vs mua 1 thùng 24 chai để được giá sỉ ưu đãi).
3. Đề xuất nguyên liệu từ Danh mục kho sản phẩm dưới đây:
${catalogContext}

Yêu cầu trả lời:
- Trả lời bằng tiếng Việt thân thiện, rõ ràng, trình bày dạng Markdown chuyên nghiệp.
- Nếu gợi ý sản phẩm cụ thể, ở cuối tin nhắn hãy đính kèm thẻ JSON đặc biệt dạng:
<!--JSON_RECOMMENDATIONS:[{"id":"prod_id","name":"Ten sp","unit":"Don vi","price":100000,"quantity":2}]-->
để hệ thống hiển thị nút "Thêm vào giỏ" cho khách hàng.`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                ...(history || []).map((h: any) => ({
                  role: h.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text }],
                })),
                { role: 'user', parts: [{ text: message }] },
              ],
            }),
          }
        )

        const data = await response.json()
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          aiTextResponse = rawText
        }
      } catch (err) {
        console.error('Gemini API Error, falling back to local B2B AI engine:', err)
      }
    }

    // 2. Bộ máy AI F&B Rule-Engine tự động nếu không có Gemini Key hoặc gọi API bị lỗi
    if (!aiTextResponse) {
      const lowerMsg = message.toLowerCase()

      if (lowerMsg.includes('trà sữa') || lowerMsg.includes('100 ly') || lowerMsg.includes('công thức')) {
        const prod1 = productsList.find((p) => p.name.includes('Hồng Trà')) || productsList[1]
        const prod2 = productsList.find((p) => p.name.includes('Kem Béo')) || productsList[2]
        const prod3 = productsList.find((p) => p.name.includes('Trân Châu')) || productsList[3]

        aiTextResponse = `🍵 **Tư Vấn Định Lượng Nguyên Liệu Trà Sữa Truyền Thống (100 Ly/Ngày)**

Dựa trên công thức chuẩn B2B cho quán:
1. **Hồng Trà Đặt Sỉ**: Cần khoảng **500g - 700g** cốt trà/ngày. ➔ Gợi ý dùng: *${prod1.name}*.
2. **Bột Kem Béo (MT35)**: Cần **2.5kg - 3kg**/ngày để giữ độ béo ngậy đậm đà. ➔ Gợi ý dùng: *${prod2.name}*.
3. **Trân Châu Đen**: Cần khoảng **1 Gói (3kg)** cho 100 suất topping. ➔ Gợi ý dùng: *${prod3.name}*.

💡 **Mẹo B2B Giá Sỉ**: Đặt hàng nguyên thùng/bao để tiết kiệm **12% - 15%** chi phí giá vốn (COGS) cho quán!`

        recommendedProducts = [
          { id: prod1.id, name: prod1.name, unit: prod1.unit, price: prod1.price, quantity: 1 },
          { id: prod2.id, name: prod2.name, unit: prod2.unit, price: prod2.price, quantity: 1 },
          { id: prod3.id, name: prod3.name, unit: prod3.unit, price: prod3.price, quantity: 1 },
        ]
      } else if (lowerMsg.includes('siro') || lowerMsg.includes('đào') || lowerMsg.includes('trà trái cây')) {
        const prod = productsList.find((p) => p.name.includes('Boduo') || p.name.includes('Siro')) || productsList[0]
        aiTextResponse = `🍹 **Tư Vấn Trà Trái Cây & Siro Pha Chế B2B**

* **Sản phẩm nổi bật**: **${prod.name}**
* **Đơn vị sỉ**: 1 Thùng = **${prod.conversion_rate || 24} ${prod.unit}**
* **Giá sỉ ưu đãi**: **${Number(prod.price).toLocaleString('vi-VN')} đ/${prod.unit}**

Chủ quán dùng trung bình 30ml/ly trà trái cây 700ml, 1 chai 1L sẽ pha được khoảng **33 ly**. Chi phí Siro chỉ khoảng **4,000 đ/ly**!`

        recommendedProducts = [
          { id: prod.id, name: prod.name, unit: prod.unit, price: prod.price, quantity: 2 },
        ]
      } else if (lowerMsg.includes('giá sỉ') || lowerMsg.includes('quy đổi') || lowerMsg.includes('thùng')) {
        aiTextResponse = `📦 **Chính Sách Quy Đổi Đơn Vị & Ưu Đãi Giá Sỉ B2B**

Hệ thống áp dụng chính sách quy đổi tự động cho chủ quán:
- **Nguyên liệu Siro / Sốt**: 1 Thùng = 24 Chai (Mua từ 1 Thùng giảm ngay 5%).
- **Trà / Bột Béo**: 1 Bao = 25kg hoặc 1 Thùng = 10 Gói.
- **Tồn kho hiện tại**: Toàn bộ kho nguyên liệu sẵn sàng giao trong vòng 24h đối với đơn sỉ nội thành.

Bạn cần tư vấn hoặc báo giá nhanh mặt hàng nào cho quán?`
      } else {
        const matchProducts = productsList.slice(0, 2)
        aiTextResponse = `Dạ chào Bạn! Tôi là **Trợ lý AI Đặt Sỉ B2B**. 

Tôi có thể hỗ trợ Bạn:
1. 🧮 **Tính định lượng nguyên liệu** theo số lượng ly quán bán mỗi ngày.
2. 📦 **Tư vấn giá sỉ & quy đổi đơn vị** (Thùng/Bao/Chai).
3. 🛒 **Tự động lên đơn sỉ & chuyển sang Zalo** duyệt đơn siêu nhanh.

Dưới đây là một số nguyên liệu bán chạy nhất hôm nay Bạn có thể tham khảo:`

        recommendedProducts = matchProducts.map((p) => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          price: p.price,
          quantity: 1,
        }))
      }
    }

    // Tách JSON recommendations từ Markdown nếu Gemini trả về
    if (aiTextResponse.includes('<!--JSON_RECOMMENDATIONS:')) {
      try {
        const jsonMatch = aiTextResponse.match(/<!--JSON_RECOMMENDATIONS:(.*?)-->/)
        if (jsonMatch && jsonMatch[1]) {
          recommendedProducts = JSON.parse(jsonMatch[1])
          aiTextResponse = aiTextResponse.replace(/<!--JSON_RECOMMENDATIONS:.*?-->/, '')
        }
      } catch (e) {
        console.error('Lỗi parse JSON_RECOMMENDATIONS:', e)
      }
    }

    return NextResponse.json({
      text: aiTextResponse,
      recommendedProducts,
    })
  } catch (error: any) {
    console.error('AI Route Error:', error)
    return NextResponse.json({ error: 'Lỗi xử lý yêu cầu từ AI Assistant' }, { status: 500 })
  }
}
