import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import FloatingActionButton from '../ui/FloatingActionButton'
import TransactionModal from '../forms/TransactionModal'
import { transactionsApi } from '../../api/transactions'
import toast from 'react-hot-toast'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleAddTransactionSuccess = async (formData) => {
    try {
      await transactionsApi.create(formData)
      toast.success('Transaction added!')
      // Dispatch a global event so that the current page (Dashboard, Transactions, Budgets)
      // will update its state dynamically without needing page reloads.
      window.dispatchEvent(new CustomEvent('transaction-added'))
    } catch (err) {
      console.error(err)
      toast.error('Failed to add transaction')
    }
  }

  return (
    <div className="flex min-h-screen bg-dark-bg text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          onMenuOpen={() => setSidebarOpen(true)} 
          onAddTransaction={() => setModalOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto page-wrapper relative">
          {children}
        </main>
      </div>

      {/* Floating Action Button for Adding Transactions */}
      <FloatingActionButton onClick={() => setModalOpen(true)} />

      {/* Global Transaction Creation Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAddTransactionSuccess}
      />
    </div>
  )
}
