import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

const priorities = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const categories = ['Design', 'Engineering', 'Marketing', 'Research']
const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

function App() {
  const [theme, setTheme] = useState('dark')
  const [tasks, setTasks] = useState([])
  const [taskInput, setTaskInput] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')
  const [taskCategory, setTaskCategory] = useState(categories[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && !task.completed) ||
        (activeFilter === 'completed' && task.completed)
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [tasks, activeFilter, searchQuery])

  const addTask = (event) => {
    event.preventDefault()
    const trimmedTask = taskInput.trim()
    if (!trimmedTask) {
      showToast('Add a task name before saving.', 'error')
      return
    }

    setTasks((currentTasks) => [
      {
        id: Date.now(),
        title: trimmedTask,
        completed: false,
        priority: taskPriority,
        category: taskCategory,
        createdAt: new Date().toISOString(),
      },
      ...currentTasks,
    ])
    setTaskInput('')
    setTaskPriority('medium')
    setTaskCategory(categories[0])
    showToast('Task added successfully!')
  }

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    showToast('Task removed.', 'info')
  }

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-copy-block">
          <p className="eyebrow">Premium Task Manager</p>
          <h1>Portfolio-ready task management.</h1>
          <p>
            A premium SaaS interface with smart filters, categories, priorities, and theme support.
            Everything is built for speed, clarity, and elegant task ownership.
          </p>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="hero-summary">
            <div>
              <span>{totalTasks}</span>
              <p>Total tasks</p>
            </div>
            <div>
              <span>{completedTasks}</span>
              <p>Completed</p>
            </div>
            <div>
              <span>{activeTasks}</span>
              <p>Open</p>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-row">
        <article className="stat-card accent-card">
          <p>Today’s focus</p>
          <h2>{activeTasks === 0 ? 'Everything done' : `${activeTasks} tasks in progress`}</h2>
        </article>
        <article className="stat-card subtle-card">
          <p>Completion rate</p>
          <h2>
            {totalTasks === 0 ? 'No data' : `${Math.round((completedTasks / totalTasks) * 100)}%`}
          </h2>
        </article>
      </section>

      <section className="toolbar-row">
        <div className="search-field">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks or categories"
            aria-label="Search tasks"
          />
        </div>

        <div className="filter-group">
          {filters.map((filterOption) => (
            <button
              key={filterOption.value}
              type="button"
              className={`filter-pill ${activeFilter === filterOption.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(filterOption.value)}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </section>

      <main className="todo-panel">
        <form className="task-form" onSubmit={addTask}>
          <div className="task-field-group">
            <label htmlFor="taskInput" className="sr-only">
              New task description
            </label>
            <input
              id="taskInput"
              type="text"
              value={taskInput}
              onChange={(event) => setTaskInput(event.target.value)}
              placeholder="Add a new task"
              aria-label="Add a new task"
            />
          </div>

          <div className="task-field-group compact">
            <label htmlFor="taskPriority" className="sr-only">
              Priority
            </label>
            <select
              id="taskPriority"
              value={taskPriority}
              onChange={(event) => setTaskPriority(event.target.value)}
              aria-label="Task priority"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div className="task-field-group compact">
            <label htmlFor="taskCategory" className="sr-only">
              Category
            </label>
            <select
              id="taskCategory"
              value={taskCategory}
              onChange={(event) => setTaskCategory(event.target.value)}
              aria-label="Task category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Add Task</button>
        </form>

        <section className="task-list">
          <AnimatePresence initial={false}>
            {filteredTasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="empty-state"
              >
                <h2>Zero tasks found</h2>
                <p>
                  Use the search and filters to narrow your list, or add a new task to begin.
                </p>
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <motion.article
                  layout
                  key={task.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <button
                    type="button"
                    className="task-toggle"
                    onClick={() => toggleTask(task.id)}
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} incomplete`
                        : `Mark ${task.title} completed`
                    }
                  >
                    <span className="checkbox" aria-hidden="true">
                      {task.completed ? '✓' : ''}
                    </span>
                  </button>

                  <div className="task-content">
                    <div className="task-title-row">
                      <p>{task.title}</p>
                      <span className={`priority-pill ${task.priority}`}> {task.priority}</span>
                    </div>
                    <div className="task-meta-row">
                      <span className="category-tag">{task.category}</span>
                      <small>{task.completed ? 'Completed' : 'In progress'}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="task-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </section>
      </main>

      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className={`toast ${toast.type}`}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </div>
  )
}

export default App
