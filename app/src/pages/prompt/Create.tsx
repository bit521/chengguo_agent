import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function PromptCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(`# 角色设定
你是{{company}}的专业客服人员。

# 任务要求
1. 友好专业
2. 准确回答
3. 必要时转人工

# 约束条件
- 不讨论竞品
- 不承诺未确认的功能

当前产品: {{product}}`);

  const [variables] = useState([
    { name: "company", type: "string", description: "公司名称" },
    { name: "product", type: "string", description: "产品名称" },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{id ? "编辑" : "创建"}Prompt</h1>
          <p className="text-muted-foreground">配置Prompt模板和变量</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/prompts")}>
            取消
          </Button>
          <Button variant="outline">保存草稿</Button>
          <Button>发布</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>名称</Label>
                <Input placeholder="客服对话模板" />
              </div>
              <div className="space-y-2">
                <Label>分类</Label>
                <Select defaultValue="customer-service">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer-service">客服</SelectItem>
                    <SelectItem value="development">开发</SelectItem>
                    <SelectItem value="marketing">营销</SelectItem>
                    <SelectItem value="analysis">分析</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>标签</Label>
                <div className="flex gap-2">
                  <Badge>客服</Badge>
                  <Badge>通用</Badge>
                  <Button variant="outline" size="sm">
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt内容</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>变量定义</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {variables.map((v) => (
                <div key={v.name} className="flex items-center gap-2 p-2 border rounded">
                  <span className="font-mono text-sm">{v.name}</span>
                  <Badge variant="outline">{v.type}</Badge>
                  <span className="text-sm text-muted-foreground flex-1">
                    {v.description}
                  </span>
                  <Button variant="ghost" size="sm">
                    删除
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm">
                添加变量
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>变更说明</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="描述本次修改的内容..." />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>预览/测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">预览</TabsTrigger>
                <TabsTrigger value="test">测试</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted">
                  <pre className="text-sm whitespace-pre-wrap">
                    {content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                      const examples: Record<string, string> = {
                        company: "辰光科技",
                        product: "Agent平台",
                      };
                      return examples[key] || `{{${key}}}`;
                    })}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="test" className="space-y-4">
                <div className="space-y-2">
                  <Label>变量填写</Label>
                  <div className="space-y-2">
                    <Input placeholder="company" defaultValue="辰光科技" />
                    <Input placeholder="product" defaultValue="Agent平台" />
                  </div>
                </div>
                <Button className="w-full">发送测试</Button>
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">
                    你好！我是辰光科技的客服，很高兴为您服务...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
