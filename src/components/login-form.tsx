'use client'

import { Card, Form, Input, Button } from 'antd-mobile'
import { login, signup } from '@/app/(main)/login/actions'

interface LoginFormProps {
    message?: string
}

export function LoginForm({ message }: LoginFormProps) {
    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }}>
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Login / Sign Up</h2>
                    <p style={{ color: '#666', margin: 0 }}>Enter your email and password to access your account.</p>
                </div>

                <div className="space-y-4">
                    <Form layout='vertical'
                        footer={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Just a visual footer, buttons are inside form for server actions */}
                            </div>
                        }
                    >
                        {/* Start of raw form wrapper to keep server actions working naturally */}
                        <form className="space-y-4">
                            <Form.Item label="Email" name="email" required>
                                <Input name="email" type="email" placeholder="m@example.com" clearable />
                            </Form.Item>
                            <Form.Item label="Password" name="password" required>
                                <Input name="password" type="password" clearable />
                            </Form.Item>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                                {/* @ts-expect-error formAction is valid on button but missing in antd-mobile types */}
                                <Button type='submit' color='primary' block size='large' formAction={login}>
                                    Log in
                                </Button>
                                {/* @ts-expect-error formAction is valid on button but missing in antd-mobile types */}
                                <Button type='submit' block size='large' fill='outline' formAction={signup}>
                                    Sign up
                                </Button>
                            </div>

                            {message && (
                                <div style={{ color: '#ff4d4f', textAlign: 'center', fontSize: '14px', marginTop: '16px' }}>
                                    {message}
                                </div>
                            )}
                        </form>
                    </Form>
                </div>
            </Card>
        </div>
    )
}
