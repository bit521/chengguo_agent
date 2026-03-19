import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Play, Pause, Settings, Trash2, Bot, Activity } from 'lucide-react'
import { agentService } from '@/services/agent'
import type { Agent } from '@/services/types/agent'

export default function AgentList() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadAgents()
  }, [searchQuery])

  const loadAgents = async () => {
    try {
      const response = await agentService.getAgentList({ keyword: searchQuery })
      setAgents(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (agent: Agent) => {
    try {
      if (agent.status === 'active') {
        await agentService.stopAgent(agent.id)
      } else {
        await agentService.startAgent(agent.id)
      }
      loadAgents()
    } catch (error) {
      console.error('Failed to toggle agent status:', error)
    }
  }

  const handleDelete = async () => {
    if (!agentToDelete) return
    try {
      await agentService.deleteAgent(agentToDelete)
      loadAgents()
    } catch (error) {
      console.error('Failed to delete agent:', error)
    } finally {
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: '运行中', variant: 'default' as const },
      inactive: { label: '已停止', variant: 'secondary' as const },
      error: { label: '错误', variant: 'destructive' as const },
      draft: { label: '草稿', variant: 'outline' as const },
    }
    const config = variants[status as keyof typeof variants] || variants.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      conversation: '对话型',
      tool: '工具型',
      analysis: '分析型',
      creative: '创作型',
      workflow: '工作流'
    }
    return labels[type] || type
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const avgSuccessRate = agents.length > 0
    ? (agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length).toFixed(1)
    : 0
  const totalCalls = agents.reduce((acc, a) => acc + a.callCount7d, 0)

  if (loading) {
    return <div className="flex items-center justify-center h-full">加载中...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent管理</h2>
          <p className="text-muted-foreground">创建和管理智能Agent</p>
        </div>
        <Button onClick={() => navigate('/agents/create')}>
          <Plus className="mr-2 h-4 w-4" />
          新建Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总Agent数</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总执行次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent列表</CardTitle>
              <CardDescription>管理所有智能Agent</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索Agent..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>调用量</TableHead>
                <TableHead>最后运行</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow
                  key={agent.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeLabel(agent.type)}</TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell>{agent.modelName}</TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">{agent.successRate}%</span>
                  </TableCell>
                  <TableCell>{agent.callCount7d.toLocaleString()}</TableCell>
                  <TableCell>{agent.lastRun}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(agent)}
                      >
                        {agent.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/agents/${agent.id}/edit`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAgentToDelete(agent.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个Agent吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
