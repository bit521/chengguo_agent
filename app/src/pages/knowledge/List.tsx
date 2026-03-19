import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Database, FileText, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBase } from '@/services/types/knowledge';

export default function KnowledgeList() {
  const navigate = useNavigate();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kbToDelete, setKbToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadKnowledgeBases();
  }, [search, type, status]);

  const loadKnowledgeBases = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 20 };
      if (search) params.search = search;
      if (type !== 'all') params.type = type;
      if (status !== 'all') params.status = status;
      
      const response = await knowledgeService.getKnowledgeBases(params);
      setKnowledgeBases(response.data);
    } catch (error) {
      console.error('加载知识库列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!kbToDelete) return;
    try {
      await knowledgeService.deleteKnowledgeBase(kbToDelete);
      loadKnowledgeBases();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setKbToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      ready: 'default',
      indexing: 'secondary',
      error: 'destructive',
      empty: 'outline',
    };
    const labels: Record<string, string> = {
      ready: '就绪',
      indexing: '索引中',
      error: '错误',
      empty: '空',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const totalDocuments = knowledgeBases.reduce((sum, kb) => sum + kb.documentCount, 0);
  const totalVectors = knowledgeBases.reduce((sum, kb) => sum + kb.vectorCount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">知识库管理</h1>
          <p className="text-muted-foreground mt-1">管理RAG知识库和文档</p>
        </div>
        <Button onClick={() => navigate('/knowledge/create')}>
          <Plus className="h-4 w-4 mr-2" />
          创建知识库
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">知识库数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">文档总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">向量总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVectors.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">知识库状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBases.filter(kb => kb.status === 'ready').length} / {knowledgeBases.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索知识库名称或描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ready">就绪</SelectItem>
                <SelectItem value="indexing">索引中</SelectItem>
                <SelectItem value="error">错误</SelectItem>
                <SelectItem value="empty">空</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>嵌入模型</TableHead>
                <TableHead>文档数</TableHead>
                <TableHead>片段数</TableHead>
                <TableHead>向量数</TableHead>
                <TableHead>存储大小</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : knowledgeBases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                knowledgeBases.map((kb) => (
                  <TableRow key={kb.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/knowledge/${kb.id}`)}
                    >
                      {kb.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{kb.embeddingModel}</Badge>
                    </TableCell>
                    <TableCell>{kb.documentCount}</TableCell>
                    <TableCell>{kb.segmentCount.toLocaleString()}</TableCell>
                    <TableCell>{kb.vectorCount.toLocaleString()}</TableCell>
                    <TableCell>{kb.storageSize}</TableCell>
                    <TableCell>{getStatusBadge(kb.status)}</TableCell>
                    <TableCell>
                      {new Date(kb.updatedAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/knowledge/${kb.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/knowledge/${kb.id}`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setKbToDelete(kb.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个知识库吗？此操作不可恢复，所有相关文档和向量数据都将被删除。
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
  );
}
