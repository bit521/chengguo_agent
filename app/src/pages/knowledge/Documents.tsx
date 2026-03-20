import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Trash2, RefreshCw, Eye } from 'lucide-react';
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
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBaseRead, DocumentRead } from '@/services/knowledge';

export default function KnowledgeDocuments() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseRead | null>(null);
  const [documents, setDocuments] = useState<DocumentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, search, status]);

  const loadData = async () => {
    try {
      setLoading(true);
      const kbId = Number(id);
      const [kbData, docsData] = await Promise.all([
        knowledgeService.getKnowledgeBase(kbId),
        knowledgeService.getDocuments(kbId, { keyword: search || undefined }),
      ]);
      setKnowledgeBase(kbData);
      setDocuments(docsData.items);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      for (const file of Array.from(files)) {
        await knowledgeService.uploadDocument(Number(id), file);
      }
      loadData();
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (confirm('确定要删除这个文档吗？此操作不可恢复！')) {
      try {
        await knowledgeService.deleteDocument(Number(id), docId);
        loadData();
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    };
    const labels: Record<string, string> = {
      completed: '已完成',
      processing: '处理中',
      failed: '失败',
      pending: '等待中',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  if (loading || !knowledgeBase) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{knowledgeBase.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">文档管理</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.docx,.md,.txt,.html,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? '上传中...' : '上传文档'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">文档总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBase.document_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">分段总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBase.segment_count.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">嵌入模型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{knowledgeBase.embedding_model}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">状态</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={knowledgeBase.status === 'ready' ? 'default' : 'secondary'}>{knowledgeBase.status}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="搜索文档名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="pending">等待中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文件名</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>分段数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>上传时间</TableHead>
                <TableHead>上传人</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无文档
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.file_type)}
                        <span className="font-medium">{doc.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.file_type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{doc.file_size || '-'}</TableCell>
                    <TableCell>{doc.segment_count}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell>{doc.uploaded_by || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === 'failed' && (
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
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

      <Card>
        <CardHeader>
          <CardTitle>支持的文件格式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">PDF (.pdf)</Badge>
            <Badge variant="secondary">Word (.docx)</Badge>
            <Badge variant="secondary">Markdown (.md)</Badge>
            <Badge variant="secondary">文本 (.txt)</Badge>
            <Badge variant="secondary">HTML (.html)</Badge>
            <Badge variant="secondary">CSV (.csv)</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            单个文件最大支持 50MB，支持批量上传
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
