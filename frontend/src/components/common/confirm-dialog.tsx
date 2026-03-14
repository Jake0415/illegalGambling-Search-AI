'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
  /** 다이얼로그 제목 */
  title: string
  /** 다이얼로그 설명 */
  description?: string
  /** 확인 버튼 스타일 */
  variant?: 'default' | 'destructive'
  /** 확인 버튼 텍스트 (기본: "확인") */
  confirmText?: string
  /** 취소 버튼 텍스트 (기본: "취소") */
  cancelText?: string
  /** 확인 콜백 */
  onConfirm: () => void | Promise<void>
  /** 트리거 요소 */
  trigger?: React.ReactNode
  /** 외부에서 open 상태 제어 */
  open?: boolean
  /** 외부에서 open 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void
}

function ConfirmDialog({
  title,
  description,
  variant = 'default',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setInternalOpen

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} disabled={loading}>
            {loading ? '처리 중...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog }
export type { ConfirmDialogProps }
