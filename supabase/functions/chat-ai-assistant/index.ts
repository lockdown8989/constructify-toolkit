
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { message, conversationHistory } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For now, return a simple AI-like response
    // In a real implementation, you would integrate with OpenAI or another AI service
    const aiResponse = generateAIResponse(message, conversationHistory)

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in chat-ai-assistant:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateAIResponse(message: string, conversationHistory: any[]): string {
  const lowerMessage = message.toLowerCase()
  
  // HR and workplace related responses
  if (lowerMessage.includes('schedule') || lowerMessage.includes('shift')) {
    return "I can help you with schedule-related questions. You can view your shifts in the calendar section, request time off, or ask about shift swaps. What specifically would you like to know about your schedule?"
  }
  
  if (lowerMessage.includes('leave') || lowerMessage.includes('vacation') || lowerMessage.includes('time off')) {
    return "For leave requests, you can submit your request through the Leave Calendar section. Make sure to provide sufficient notice and include the reason for your leave. Your manager will review and approve the request."
  }
  
  if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
    return "For payroll inquiries, please check the Payroll section of your dashboard. If you have questions about your pay stub, deductions, or payment dates, you can also contact the HR department directly."
  }
  
  if (lowerMessage.includes('attendance') || lowerMessage.includes('clock in') || lowerMessage.includes('clock out')) {
    return "You can clock in and out using the attendance system. Make sure to clock in at your scheduled start time and clock out when your shift ends. If you're having trouble with the system, try refreshing the page or contact IT support."
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return "Hello! I'm your AI HR assistant. I can help you with questions about schedules, leave requests, payroll, attendance, company policies, and general workplace inquiries. What would you like to know?"
  }
  
  if (lowerMessage.includes('policy') || lowerMessage.includes('policies')) {
    return "For company policies, please refer to your employee handbook or the Documents section in your dashboard. If you need clarification on any specific policy, feel free to ask or contact HR directly."
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
    return "You can contact HR through this chat system, by phone during business hours, or by email. For urgent matters outside business hours, please use the emergency contact information provided in your employee handbook."
  }
  
  // Default response
  return "I'm here to help with your workplace questions. I can assist with schedules, leave requests, payroll inquiries, attendance, and company policies. Could you please provide more details about what you'd like to know?"
}
