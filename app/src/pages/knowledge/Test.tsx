import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KnowledgeTest() {
  const { id } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([
    {
      id: "1",
      score: 0.95,
      documentName: "产品手册v3.pdf",
      content: "辰光Agent平台支持多种大语言模型，包括OpenAI的GPT-4、GPT-3.5，Anthropic的Claude系列，以及阿里云的通义千问等国产模型...",
      keywords: ["模型", "GPT-4", "Claude"],
    },
    {
      id: "2",
      score: 0.89,
      documentName: "API文档.md",
      content: "模型配置接口支持动态切换模型供应商，用户可以通过管理后台配置多个模型端点...",
      keywords: ["模型", "配置", "API"],
    },
    {
      id: "3",
      score: 0.82,
      documentName: "FAQ汇总.docx",
      content: "Q: 平台支持本地部署的模型吗？A: 支持，可以通过自定义供应商配置连接本地部署的开源模型...",
      keywords: ["本地部署", "模型"],
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">检索测试</h1>
        <p className="text-muted-foreground">产品知识库的检索测试</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>查询输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="辰光Agent平台支持哪些模型？"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="grid grid-cols-4 gap-4">
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
              <Label>Top K</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label>相似度阈值</Label>
              <Input type="number" step="0.1" defaultValue="0.7" />
            </div>
            <div className="space-y-2">
              <Label>Rerank</Label>
              <Select defaultValue="off">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">关闭</SelectItem>
                  <SelectItem value="bge">BGE Reranker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full">检索</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>检索结果</CardTitle>
            <span className="text-sm text-muted-foreground">5条结果, 耗时 0.23s</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((result, idx) => (
            <div key={result.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{idx + 1}</Badge>
                  <span className="text-sm font-medium">相似度: {result.score}</span>
                  <span className="text-sm text-muted-foreground">
                    来源: {result.documentName}
                  </span>
                </div>
              </div>
              <p className="text-sm">{result.content}</p>
              <div className="flex gap-2">
                {result.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
