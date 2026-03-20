import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Eye,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBaseRead, DocumentRead } from '@/services/knowledge';

export default function KnowledgeDetail() {
  const { id } = useParams();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseRead | null>(null);
  const [documents, setDocuments] = useState<DocumentRead[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRead | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  
  // OCR相关状态
  const [originalContent, setOriginalContent] = useState('');
  const [ocrContent, setOcrContent] = useState('');
  const [correctedContent, setCorrectedContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadKnowledgeBase();
      loadDocuments();
    }
  }, [id]);

  const loadKnowledgeBase = async () => {
    try {
      const data = await knowledgeService.getKnowledgeBase(Number(id));
      setKnowledgeBase(data);
    } catch (error) {
      console.error('加载知识库失败:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await knowledgeService.getDocuments(Number(id));
      setDocuments(response.items);
    } catch (error) {
      console.error('加载文档列表失败:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      if (file.type.startsWith('image/')) {
        await handleImageUpload(file);
      } else {
        await handleDocumentUpload(file);
      }
      loadDocuments();
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    // 创建图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsOcrProcessing(true);
    
    try {
      // 模拟OCR识别
      const formData = new FormData();
      formData.append('file', file);
      formData.append('knowledgeBaseId', id!);
      
      // 调用OCR服务（这里是模拟）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟OCR识别结果
      const mockOcrResult = `这是通过OCR识别的文本内容。

图片文件名: ${file.name}
识别时间: ${new Date().toLocaleString('zh-CN')}

识别的文本内容：
产品名称：辰光Agent平台
版本号：v2.0.1
发布日期：2024年2月8日

注意：此内容由OCR自动识别，可能存在识别错误，请人工校对。`;

      setOcrContent(mockOcrResult);
      setCorrectedContent(mockOcrResult);
      setOriginalContent('');
      setEditMode(true);
      
      const newDoc: DocumentRead = {
        id: Date.now(),
        knowledge_base_id: Number(id),
        file_name: file.name,
        file_type: 'pdf',
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'processing',
        segment_count: 0,
        word_count: mockOcrResult.length,
        uploaded_by: 'current-user',
        uploaded_at: new Date().toISOString(),
      };
      
      setSelectedDoc(newDoc);
      
    } catch (error) {
      console.error('OCR识别失败:', error);
      alert('OCR识别失败，请重试');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('knowledgeBaseId', id!);
    
    // 模拟上传和处理
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟文档内容
    const mockContent = `文档名称: ${file.name}
上传时间: ${new Date().toLocaleString('zh-CN')}

这是文档的内容预览...

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

文档已成功上传并开始处理。系统将自动进行分段和向量化处理。`;

    setOriginalContent(mockContent);
    setOcrContent('');
    setCorrectedContent(mockContent);
    setImagePreview(null);
    
    const newDoc: DocumentRead = {
      id: Date.now(),
      knowledge_base_id: Number(id),
      file_name: file.name,
      file_type: file.name.endsWith('.pdf') ? 'pdf' : 
                file.name.endsWith('.docx') ? 'docx' :
                file.name.endsWith('.md') ? 'md' : 'txt',
      file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      status: 'processing',
      segment_count: 0,
      word_count: mockContent.length,
      uploaded_by: 'current-user',
      uploaded_at: new Date().toISOString(),
    };
    
    setSelectedDoc(newDoc);
    setEditMode(false);
  };

  const handleSaveCorrection = async () => {
    if (!selectedDoc) return;
    try {
      await knowledgeService.updateSegment(Number(id), selectedDoc.id, { content: correctedContent });
      alert('内容已保存并开始处理');
      setEditMode(false);
      loadDocuments();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      await knowledgeService.deleteDocument(Number(id), docToDelete);
      loadDocuments();
      if (selectedDoc?.id === docToDelete) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf' || fileType === 'docx' || fileType === 'txt' || fileType === 'md') {
      return <FileText className="h-4 w-4" />;
    }
    return <ImageIcon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: '已完成', variant: 'default' as const, icon: CheckCircle },
      processing: { label: '处理中', variant: 'secondary' as const, icon: Loader2 },
      failed: { label: '失败', variant: 'destructive' as const, icon: AlertCircle },
      pending: { label: '等待中', variant: 'outline' as const, icon: Loader2 },
    };
    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  if (!knowledgeBase) {
    return <div className="flex items-center justify-center h-full">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{knowledgeBase.name}</h1>
          <p className="text-muted-foreground">{knowledgeBase.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">编辑配置</Button>
          <label htmlFor="file-upload">
            <Button disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  上传文档/图片
                </>
              )}
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </div>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">文档管理</TabsTrigger>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="config">配置</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
            {/* 左侧文档列表 */}
            <Card className="col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">文档列表 ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-360px)]">
                  <div className="space-y-1 p-4 pt-0">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                          selectedDoc?.id === doc.id ? 'bg-accent border-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setEditMode(false);
                          setOriginalContent(`文档内容加载中...\n\n文件名: ${doc.file_name}`);
                          setOcrContent('');
                          setCorrectedContent('');
                          setImagePreview(null);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          {getFileIcon(doc.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">{doc.file_size}</p>
                            <div className="mt-1">
                              {getStatusBadge(doc.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocToDelete(doc.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>暂无文档</p>
                        <p className="text-xs mt-1">点击右上角上传文档</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 右侧内容区域 */}
            <div className="col-span-9 space-y-4">
              {!selectedDoc ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>请从左侧选择一个文档查看内容</p>
                    <p className="text-sm mt-2">或上传新的文档/图片</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* 文档信息栏 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{selectedDoc.file_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              上传于 {selectedDoc.uploaded_at ? new Date(selectedDoc.uploaded_at).toLocaleString('zh-CN') : '-'}
                            </p>
                          </div>
                          {getStatusBadge(selectedDoc.status)}
                        </div>
                        <div className="flex gap-2">
                          {!editMode && ocrContent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditMode(true)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              编辑校对
                            </Button>
                          )}
                          {editMode && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditMode(false);
                                  setCorrectedContent(ocrContent);
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                取消
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveCorrection}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                保存
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 内容展示区域 */}
                  {imagePreview ? (
                    // 图片OCR模式：左侧图片，右侧OCR结果
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            原始图片
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[calc(100vh-480px)]">
                            <img 
                              src={imagePreview} 
                              alt="上传的图片" 
                              className="w-full rounded-lg border"
                            />
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            {isOcrProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                OCR识别中...
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                {editMode ? 'OCR识别结果（可编辑）' : 'OCR识别结果'}
                              </>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isOcrProcessing ? (
                            <div className="flex items-center justify-center h-[calc(100vh-480px)]">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">正在识别图片内容...</p>
                              </div>
                            </div>
                          ) : editMode ? (
                            <Textarea
                              value={correctedContent}
                              onChange={(e) => setCorrectedContent(e.target.value)}
                              className="h-[calc(100vh-480px)] font-mono text-sm resize-none"
                              placeholder="OCR识别的内容将显示在这里，您可以进行编辑校对..."
                            />
                          ) : (
                            <ScrollArea className="h-[calc(100vh-480px)]">
                              <pre className="text-sm whitespace-pre-wrap font-mono">
                                {ocrContent || '等待OCR识别...'}
                              </pre>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // 普通文档模式：单栏显示
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          文档内容
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[calc(100vh-480px)]">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {originalContent || '加载中...'}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">文档数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{knowledgeBase.document_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">分段数</CardTitle>
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
                {getStatusBadge(knowledgeBase.status)}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>索引状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>索引进度</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "100%" }} />
                </div>
                {getStatusBadge(knowledgeBase.status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Embedding模型:</span>
                  <span>{knowledgeBase.embedding_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建人:</span>
                  <span>{knowledgeBase.created_by}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建时间:</span>
                  <span>{new Date(knowledgeBase.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>知识库配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Embedding模型</label>
                <Input value={knowledgeBase.embedding_model} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">分段策略</label>
                <Input value="自动分段 (500 tokens, 50 overlap)" readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">检索策略</label>
                <Input value="混合检索 (Top 5, 阈值 0.7)" readOnly />
              </div>
              <Button>保存配置</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个文档吗？此操作不可恢复，文档的所有分段和向量数据都将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-red-600 text-white hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
