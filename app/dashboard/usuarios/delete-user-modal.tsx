import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import type { User } from "@/types/user"

interface DeleteUserModalProps {
  user: User | null
  onClose: () => void
  onConfirm: (userId: number) => void
}

export function DeleteUserModal({ user, onClose, onConfirm }: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const isValid = confirmText === user?.username

  return (
    <AlertDialog open={!!user} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El usuario <span className="font-semibold">{user?.username}</span> será eliminado permanentemente.
            <div className="mt-4 space-y-2">
              <Label htmlFor="confirmText">
                Escriba <span className="font-semibold">{user?.username}</span> para confirmar
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user?.username}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => user && onConfirm(user.id)}
            disabled={!isValid}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
    } 