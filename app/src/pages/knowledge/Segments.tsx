import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KnowledgeSegments() {
  const { id } = useParams();
  const [segments] = useState([
    {
      id: "1",
      position: 1,
      documentName: "产品手册v3.pdf",
      content: "辰光Agent平台是一款企业级AI Agent管理系统，提供Agent全生命周期管理、知识库管理、Prompt工程等核心能力。平台支持多种大语言模型...",
      wordCount: 487,
      hitCount: 234,
      keywords: ["Agent", "平台", "管理", "企业级"],
    },
    {
      id: "2",
      position: 2,
      documentName: "产品手册v3.pdf",
      content: "系统架构采用微服务设计，前端使用React + TypeScript构建，后端基于Spring Boot，支持水平扩展和高可用部署...",
      wordCount: 512,
      hitCount: 189,
      keywords: ["架构", "微服务", "React"],
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分段管理</h1>
          <p className="text-muted-foreground">产品知识库的文档分段</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input placeholder="搜索分段内容..." className="flex-1" />
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="来源文档" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部文档</SelectItem>
            <SelectItem value="doc1">产品手册v3.pdf</SelectItem>
            <SelectItem value="doc2">FAQ汇总.docx</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{segment.position}</Badge>
                  <span className="text-sm text-muted-foreground">
                    来源: {segment.documentName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    字数: {segment.wordCount}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    命中: {segment.hitCount}次
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">编辑</Button>
                  <Button variant="ghost" size="sm">删除</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{segment.content}</p>
              <div className="flex gap-2">
                <span className="text-sm text-muted-foreground">关键词:</span>
                {segment.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">上一页</Button>
          <Button variant="outline" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">...</Button>
          <Button variant="outline" size="sm">894</Button>
          <Button variant="outline" size="sm">下一页</Button>
        </div>
      </div>
    </div>
  );
}
