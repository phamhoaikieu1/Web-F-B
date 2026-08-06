'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Order } from '@/types/database'

export interface RealtimeToastPayload {
  orderCode: string
  customerName: string
  totalAmount: number
}

// Hàm phát tiếng chuông báo hiệu Đơn Hàng Mới qua Web Audio API
export function playNewOrderChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    // Nốt 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime)
    gain1.gain.setValueAtTime(0.25, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.25)

    // Nốt 2: A5 (880 Hz) phát ngay sau đó 0.15s
    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime)
      gain2.gain.setValueAtTime(0.3, ctx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start()
      osc2.stop(ctx.currentTime + 0.4)
    }, 150)
  } catch (e) {
    console.warn('Không thể phát âm thanh thông báo:', e)
  }
}

export function useOrderRealtime() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeToast, setRealtimeToast] = useState<RealtimeToastPayload | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data: profData } = await supabase.from('profiles').select('*')
    const profMap = new Map<string, string>()
    if (profData) {
      profData.forEach((p) => profMap.set(p.id, p.full_name))
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi lấy danh sách đơn:', error)
    } else if (data) {
      const formatted = data.map((o: any) => ({
        ...o,
        approved_by_name: o.approved_by_user_id ? profMap.get(o.approved_by_user_id) || 'Nhân sự' : o.approved_by_name || null,
        cancelled_by_name: o.cancelled_by_user_id ? profMap.get(o.cancelled_by_user_id) || 'Nhân sự' : o.cancelled_by_name || null,
        created_by_name: o.created_by_user_id ? profMap.get(o.created_by_user_id) || null : null,
        completed_by_name: o.completed_by_user_id ? profMap.get(o.completed_by_user_id) || o.completed_by_name : o.completed_by_name || null,
      }))
      setOrders(formatted)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
            playNewOrderChime()
            setRealtimeToast({
              orderCode: newOrder.order_code,
              customerName: newOrder.customer_name,
              totalAmount: Number(newOrder.total_amount) || 0,
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order
            setOrders((prev) =>
              prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
            )
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Supabase Realtime Order Channel Connected Successfully!')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders, supabase])

  return {
    orders,
    setOrders,
    loading,
    realtimeToast,
    setRealtimeToast,
    fetchOrders,
    playNewOrderChime,
  }
}
