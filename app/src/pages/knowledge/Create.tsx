import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function KnowledgeCreate() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">创建知识库</h1>
          <p className="text-muted-foreground">配置知识库索引和检索策略</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/knowledge")}>取消</Button>
          <Button>创建</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>名称</Label>
            <Input placeholder="产品知识库" />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea placeholder="包含产品手册、FAQ等文档" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>索引配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Embedding模型</Label>
            <Select defaultValue="text-embedding-3-small">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分段策略</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动分段</SelectItem>
                  <SelectItem value="paragraph">按段落</SelectItem>
                  <SelectItem value="sentence">按句子</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>分隔符</Label>
              <Select defaultValue="newline">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newline">换行符</SelectItem>
                  <SelectItem value="paragraph">段落</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分段大小 (tokens)</Label>
              <Input type="number" defaultValue="500" />
            </div>
            <div className="space-y-2">
              <Label>分段重叠 (tokens)</Label>
              <Input type="number" defaultValue="50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>检索配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>检索策略</Label>
              <Select defaultValue="hybrid">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vector">向量检索</SelectItem>
                  <SelectItem value="fulltext">全文检索</SelectItem>
                  <SelectItem value="hybrid">混合检索</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rerank模型</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  <SelectItem value="bge-reranker">BGE Reranker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Top K</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label>相似度阈值</Label>
              <Input type="number" step="0.1" defaultValue="0.7" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>数据源</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">文件上传</TabsTrigger>
              <TabsTrigger value="web">网页抓取</TabsTrigger>
              <TabsTrigger value="api">API同步</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">拖拽文件到此处或点击上传</p>
                <Button variant="outline" className="mt-4">选择文件</Button>
              </div>
            </TabsContent>
            <TabsContent value="web">
              <Input placeholder="输入网页URL" />
            </TabsContent>
            <TabsContent value="api">
              <Input placeholder="API端点" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
